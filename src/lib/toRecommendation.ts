// 알고리즘 결과(Plan) → 화면이 쓰는 Recommendation 으로 변환
import type { Plan } from "../types/plan";
import type { Recommendation } from "../types/recommendation";

export function toRecommendation(p: Plan, idPrefix = "r"): Recommendation {
  const holidayDates = p.days.filter((d) => d.type === "holiday").map((d) => d.date);
  return {
    id: `${idPrefix}-${p.start}`,
    title: p.title,
    start: p.start,
    end: p.end,
    leaveUsed: p.leave,
    totalDays: p.rest,
    leaveDates: p.leaveDates,
    holidayNames: p.holidays,
    holidayDates,
  };
}
