// 후보 만들기: 공휴일 + 주말로 "연차를 이렇게 쓰면 이렇게 쉰다"는 구간 후보를 직접 계산한다.
//
// 아이디어: 쉬는 날(주말·공휴일)은 공짜이고, 평일을 연차로 쓰면 쉬는 날이 된다.
// 그래서 "연차를 k개 쓰는 연속 구간"을 모든 시작점에서 만들고, 양 끝은 쉬는 날을 공짜로 끝까지 붙인다.
import type { CellType, Plan, PlanDay, PlanParams } from "../types/plan";
import { buildDays, type CalendarDay } from "./calendar";

// 추천 제목 규칙 (공휴일 이름을 이어 붙이지 않고 대표 연휴 이름 하나로 정리한다)
//  1) "대체공휴일(X)" → X, "임시공휴일(…)" → 임시공휴일, "설날/설날 연휴" → 설, "추석/추석 연휴" → 추석
//  2) 설·추석이 있으면 그 연휴가 대표, 아니면 구간 안에서 가장 늦게 나오는 공휴일이 대표
//     (예: 노동절·대체공휴일(노동절)·어린이날 → "어린이날 연휴")
//  3) "대표 이름 + 연휴". 공휴일이 하나도 없으면 "주말 연결"
const MAJOR = ["설", "추석"];

function baseName(raw: string): string {
  let n = raw;
  const sub = n.match(/^대체공휴일\((.+)\)$/);
  if (sub) n = sub[1];
  if (/^임시공휴일/.test(n)) return "임시공휴일";
  if (/^설(날)?( 연휴)?$/.test(n)) return "설";
  if (/^추석( 연휴)?$/.test(n)) return "추석";
  return n;
}

export function makeLabel(names: string[]): string {
  if (!names.length) return "주말 연결";
  const bases = names.map(baseName);
  const named = bases.filter((b) => b !== "대체공휴일"); // 이름 없는 "대체공휴일"은 다른 이름이 있으면 무시
  const pool = named.length ? named : bases;
  const rep = pool.find((b) => MAJOR.includes(b)) ?? pool[pool.length - 1];
  return `${rep} 연휴`;
}

export function toCard(days: CalendarDay[], i: number, j: number, leave: number): Plan {
  const seg = days.slice(i, j + 1);
  const names: string[] = [];
  for (const d of seg) for (const n of d.names) if (!names.includes(n)) names.push(n);
  const cells: PlanDay[] = seg.map((d) => ({
    date: d.date,
    type: (d.type === "workday" ? "leave" : d.type) as CellType,
  }));
  const label = makeLabel(names);
  const rest = seg.length;
  return {
    title: label,
    label,
    start: seg[0].date,
    end: seg[seg.length - 1].date,
    leave,
    rest,
    efficiency: +(rest / leave).toFixed(1),
    leaveDates: cells.filter((c) => c.type === "leave").map((c) => c.date),
    holidays: names,
    days: cells,
    tip: `연차 ${leave}개로 ${rest}일 연속 휴가`,
  };
}

// 연차 1~maxLeave개를 쓰는 "끝까지 늘린" 구간을 전부 만든다.
// requireHoliday가 true면 공휴일이 낀 구간만 만든다 (나눠쓰기), false면 주말만 이은 구간도 만든다 (몰아쓰기).
function makeWindows(days: CalendarDay[], maxLeave: number, requireHoliday: boolean): Plan[] {
  const out: Plan[] = [];
  const last = days.length - 1;
  for (let i = 0; i <= last; i++) {
    // 왼쪽이 쉬는 날이면 더 일찍 시작하는 구간이 공짜로 더 길다 → 시작점이 아님
    if (i > 0 && days[i - 1].type !== "workday") continue;
    let leave = 0;
    let holidayCount = 0;
    for (let j = i; j <= last; j++) {
      if (days[j].type === "workday") leave++;
      else if (days[j].type === "holiday") holidayCount++;
      if (leave > maxLeave) break;
      // 다음 날이 평일일 때만 여기서 끝낸다 (그 전까지는 쉬는 날을 공짜로 계속 붙임)
      const endsHere = j === last || days[j + 1].type === "workday";
      if (!endsHere || leave < 1) continue;
      if (j - i + 1 - leave < 1) continue; // 쉬는 날이 하나도 안 붙으면 의미 없음
      if (requireHoliday && holidayCount < 1) continue; // 나눠쓰기는 공휴일이 낀 연휴만
      out.push(toCard(days, i, j, leave));
    }
  }
  return out;
}

export function buildCandidates(params: PlanParams): { combined: Plan[]; split: Plan[] } {
  const N = Math.floor(params.leaveCount);
  const days = buildDays(params.from, params.to, params.holidays);
  if (!(N >= 1) || !days.length) return { combined: [], split: [] };
  return {
    combined: makeWindows(days, N, false),
    // 나눠쓰기: 연차 1개로 만드는 공휴일 연휴만 후보 (공휴일이 없는 주말 연결은 제외 — 기획 기준)
    split: makeWindows(days, 1, true),
  };
}
