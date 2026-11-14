import type { Recommendation } from "../types/recommendation";
import { dotDateWd, shortDateWd } from "./date";

/** 2027.9.11(토) – 9.19(일)  (같은 해면 끝 날짜의 연도는 생략) */
export function periodLabel(rec: Recommendation): string {
  const sameYear = rec.start.slice(0, 4) === rec.end.slice(0, 4);
  return `${dotDateWd(rec.start)} – ${sameYear ? shortDateWd(rec.end) : dotDateWd(rec.end)}`;
}

/** 가장 길게 쉬는 추천: 쉬는 일수가 가장 길고, 같으면 연차 효율이 높은 것 */
export function pickLongest(results: Recommendation[]): Recommendation {
  return [...results].sort(
    (a, b) => b.totalDays - a.totalDays || b.totalDays / b.leaveUsed - a.totalDays / a.leaveUsed,
  )[0];
}

/** 클립보드에 복사할 일정 문구 */
export function planText(rec: Recommendation): string {
  const leave = rec.leaveDates.map(shortDateWd).join(", ");
  return `${rec.title} ${periodLabel(rec)}\n${rec.totalDays}일 휴식 · 연차 ${rec.leaveUsed}일 사용 (${leave})`;
}
