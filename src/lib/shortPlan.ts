// "짧게 자주" 스타일: 연차 1~2일로 만드는 여러 연휴를 골라 함께 쓰는 화면용 헬퍼
import type { DayKind } from "../ui";
import type { Recommendation } from "../types/recommendation";
import { addDays, dow, isWeekend, weekdayOf } from "./date";
import { holidayName } from "./sampleRecommend";

export interface StripCell { iso: string; day: number; weekday: string; kind: DayKind }

/** 긴 휴식순 (같으면 연차 효율이 높은 순) */
export function sortByRest(recs: Recommendation[]): Recommendation[] {
  return [...recs].sort((a, b) => b.totalDays - a.totalDays || b.totalDays / b.leaveUsed - a.totalDays / a.leaveUsed);
}

/** 처음 선택: 긴 휴식순으로, 남은 연차가 허락하는 만큼 담는다 */
export function pickInitial(sorted: Recommendation[], available: number): string[] {
  const ids: string[] = [];
  let left = available;
  for (const r of sorted) {
    if (r.leaveUsed <= left) { ids.push(r.id); left -= r.leaveUsed; }
  }
  return ids;
}

/** 연휴 하나를 7칸 스트립으로: 시작 하루 전부터, 범위 밖 날짜는 'out' 으로 채운다 */
export function stripCells(rec: Recommendation): StripCell[] {
  return Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(rec.start, i - 1);
    const inRange = iso >= rec.start && iso <= rec.end;
    const w = dow(iso);
    // 범위 안의 연차 아닌 날은 모두 쉬는 날: 토요일(공휴일 아님)만 파랗고, 일요일·쉬는 평일은 공휴일처럼 빨갛다
    const kind: DayKind = !inRange ? "out"
      : rec.leaveDates.includes(iso) ? "leave"
      : w === 6 && !holidayName(iso) ? "sat"
      : "holiday";
    return { iso, day: Number(iso.slice(8)), weekday: weekdayOf(iso), kind };
  });
}

/** "주말 2일 + 공휴일 3일 + 연차 1일" (0인 항목은 뺀다) */
export function breakdown(rec: Recommendation): string {
  let weekend = 0, holiday = 0;
  for (let d = rec.start; d <= rec.end; d = addDays(d, 1)) {
    if (rec.leaveDates.includes(d)) continue;
    // 주말(공휴일 아님)만 "주말", 그 외 쉬는 날(쉬는 평일 포함)은 "공휴일"
    if (isWeekend(d) && !holidayName(d)) weekend++;
    else holiday++;
  }
  return [
    weekend && `주말 ${weekend}일`,
    holiday && `공휴일 ${holiday}일`,
    rec.leaveUsed && `연차 ${rec.leaveUsed}일`,
  ].filter(Boolean).join(" + ");
}

/** "연휴" 접미사를 뗀 이름 (추석 연휴 → 추석) */
export const shortName = (rec: Recommendation) => rec.title.replace(/\s*연휴$/, "");

/** 섹션 제목의 "N일로 만드는 긴 연휴" */
export function leaveLabel(recs: Recommendation[]): string {
  const n = recs.map((r) => r.leaveUsed);
  const min = Math.min(...n), max = Math.max(...n);
  return min === max ? `${min}일로 만드는 긴 연휴` : `연차 ${min}~${max}일로 만드는 긴 연휴`;
}
