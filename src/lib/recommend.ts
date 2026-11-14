// 몰아쓰기 베스트: 연차 N개 이하로 가장 길게 이어 쉬는 구간을, 겹치지 않게 상위 4개. (결과 화면: 1위 카드 + 다른 추천 3개)
// 정렬: 쉬는 날 많은 순 → 연차 적은 순 → 빠른 날짜 순
import type { CombinedSummary, Plan, PlanParams, RankedPlan } from "../types/plan";
import { addDays } from "./date";

export const COMBINED_TOP = 4;

const inRange = (p: Plan, params: PlanParams) => p.start >= params.from && p.end <= params.to;

// 겹치거나 맞닿으면(하루도 안 떨어지면) 같은 연휴로 본다
const touches = (a: Plan, b: Plan) => a.start <= addDays(b.end, 1) && b.start <= addDays(a.end, 1);

export function recommendCombined(params: PlanParams, candidates: Plan[]): RankedPlan[] {
  const N = Math.floor(params.leaveCount);
  const sorted = candidates
    .filter((p) => p.leave <= N && inRange(p, params))
    .map((p) => ({ ...p, efficiency: +(p.rest / p.leave).toFixed(1) }))
    .sort((a, b) => b.rest - a.rest || a.leave - b.leave || (a.start < b.start ? -1 : 1));

  const picked: Plan[] = [];
  for (const p of sorted) {
    if (picked.length < COMBINED_TOP && !picked.some((q) => touches(p, q))) picked.push(p);
  }
  return picked.map((p, i) => ({ ...p, rank: i + 1 }));
}

// 몰아쓰기 요약 카드 3개: 사용 연차(N개 이하) / 최대 연속 휴가 / 추천 구간 수
export function summarizeCombined(plans: Plan[], leaveCount: number): CombinedSummary {
  return {
    leaveCount,
    maxRest: plans.reduce((m, p) => Math.max(m, p.rest), 0),
    count: plans.length,
  };
}
