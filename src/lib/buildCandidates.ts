// 후보 만들기: 공휴일 + 주말로 "연차를 이렇게 쓰면 이렇게 쉰다"는 구간 후보를 직접 계산한다.
//
// 아이디어: 쉬는 날(주말·공휴일)은 공짜이고, 평일을 연차로 쓰면 쉬는 날이 된다.
// 그래서 "연차를 k개 쓰는 연속 구간"을 모든 시작점에서 만들고, 양 끝은 쉬는 날을 공짜로 끝까지 붙인다.
import type { CellType, Plan, PlanDay, PlanParams } from "../types/plan";
import { buildDays, type CalendarDay } from "./calendar";

const SPLIT_MAX_LEAVE = 2; // 나눠쓰기에서 한 번의 연휴에 쓰는 연차 최대 개수 (기획서: 1~2개)

function makeLabel(names: string[]): string {
  if (!names.length) return "주말 연결";
  if (names.length <= 3) return names.join(" · ");
  return `${names.slice(0, 2).join(" · ")} 외 ${names.length - 2}`;
}

function toCard(days: CalendarDay[], i: number, j: number, leave: number): Plan {
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
  const splitMax = Math.min(N, params.splitMaxLeave || SPLIT_MAX_LEAVE);
  return {
    combined: makeWindows(days, N, false),
    split: makeWindows(days, splitMax, true),
  };
}
