// 화면이 부르는 진입 함수: 입력 조건 + 공휴일 → 추천 목록 + 요약
//   길게 한 번 몰아서(bulk)  → 몰아쓰기: 길게 쉬는 구간 상위 4개 = 1위 카드 + 다른 추천 3개 (서로 택1)
//   짧게 자주(short)         → 나눠쓰기: 공휴일 연휴에 연차 1개씩 붙이는 자리들의 조합 (전부 함께 사용, 남는 연차는 반대편에 1개 더)
// ※ 기획에서 balanced 스타일은 빠졌다. 값이 들어오면 몰아쓰기로 처리한다.
import type { Holiday, Plan, PlanParams } from "../types/plan";
import type { Recommendation, SearchCondition } from "../types/recommendation";
import { buildCandidates } from "./buildCandidates";
import { COMBINED_TOP, recommendCombined } from "./recommend";
import { recommendSplit } from "./recommendSplit";
import { toRecommendation } from "./toRecommendation";

export type RecommendMode = "combined" | "split";

export interface RecommendSummary {
  /** 입력한 남은 연차 */
  leaveTotal: number;
  /** 추천으로 쓰는 연차. 몰아쓰기는 1위 기준, 나눠쓰기는 전부 합친 값 */
  leaveUsed: number;
  /** 몰아쓰기는 1위의 쉬는 날, 나눠쓰기는 전부 합친 쉬는 날 */
  restTotal: number;
  count: number;
}

export interface RecommendResult {
  mode: RecommendMode;
  /** 화면에 보여줄 순서. 몰아쓰기: 길게 쉬는 순(1위부터) / 나눠쓰기: 날짜순 */
  items: Recommendation[];
  /**
   * 각 추천을 골랐을 때 남는 연차 = leaveTotal - item.leaveUsed (몰아쓰기는 추천이 서로 택1이라 항목별로 다름).
   * 나눠쓰기는 전부 함께 쓰므로 leaveTotal - summary.leaveUsed.
   */
  summary: RecommendSummary;
}

export function recommendByStyle(cond: SearchCondition, holidays: Holiday[]): RecommendResult {
  const params: PlanParams = { leaveCount: cond.leaveDays, from: cond.start, to: cond.end, holidays };
  const candidates = buildCandidates(params);
  const empty = (mode: RecommendMode): RecommendResult => ({
    mode,
    items: [],
    summary: { leaveTotal: cond.leaveDays, leaveUsed: 0, restTotal: 0, count: 0 },
  });

  if (cond.style === "short") {
    const r = recommendSplit(params, candidates.split);
    if (!r.count) return empty("split");
    return {
      mode: "split",
      items: r.picks.map((p: Plan) => toRecommendation(p, "split")),
      summary: { leaveTotal: cond.leaveDays, leaveUsed: r.leaveUsed, restTotal: r.restTotal, count: r.count },
    };
  }

  const picks = recommendCombined(params, candidates.combined).slice(0, COMBINED_TOP);
  if (!picks.length) return empty("combined");
  return {
    mode: "combined",
    items: picks.map((p) => toRecommendation(p, "combined")),
    summary: { leaveTotal: cond.leaveDays, leaveUsed: picks[0].leave, restTotal: picks[0].rest, count: picks.length },
  };
}
