// 나눠쓰기 베스트: 연차 합이 N 이하이면서 총 쉬는 날이 최대가 되는, 서로 안 겹치는 짧은 연휴 조합.
// 연휴 후보끼리는 겹치거나 맞닿으면 안 된다(사이에 평일이 최소 하루 있어야 별개의 연휴).
// 겹침이 있으므로 "구간 스케줄링 + 연차 예산" DP로 푼다.
// 점수 = 쉬는 날*1000 - 연차 → 쉬는 날이 같으면 연차를 덜 쓰는 쪽을 고른다.
import type { Plan, PlanParams, RankedPlan, SplitResult } from "../types/plan";
import { addDays } from "./date";

export function recommendSplit(params: PlanParams, candidates: Plan[]): SplitResult {
  const N = Math.floor(params.leaveCount);
  if (!(N >= 1)) return { picks: [], leaveUsed: 0, restTotal: 0, count: 0 }; // 연차 개수가 비었거나 숫자가 아님

  const items = candidates
    .filter((p) => p.leave <= N && p.start >= params.from && p.end <= params.to)
    .sort((a, b) => (a.end < b.end ? -1 : a.end > b.end ? 1 : a.start < b.start ? -1 : 1));
  const n = items.length;
  const budget = Math.min(N, items.reduce((s, p) => s + p.leave, 0));

  // prev[x] = items[x]와 안 부딪히는 앞쪽 후보의 개수 (end가 start 하루 전보다 앞인 것들)
  const prev = items.map((it) => {
    const limit = addDays(it.start, -1);
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (items[mid].end < limit) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  });

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(budget + 1).fill(0));
  const took: boolean[][] = Array.from({ length: n + 1 }, () => new Array<boolean>(budget + 1).fill(false));
  for (let x = 1; x <= n; x++) {
    const it = items[x - 1];
    const score = it.rest * 1000 - it.leave;
    for (let w = 0; w <= budget; w++) {
      dp[x][w] = dp[x - 1][w];
      if (it.leave <= w) {
        const t = dp[prev[x - 1]][w - it.leave] + score;
        if (t > dp[x][w]) {
          dp[x][w] = t;
          took[x][w] = true;
        }
      }
    }
  }

  const chosen: Plan[] = [];
  let xx = n;
  let ww = budget;
  while (xx > 0) {
    if (took[xx][ww]) {
      chosen.push(items[xx - 1]);
      ww -= items[xx - 1].leave;
      xx = prev[xx - 1];
    } else xx--;
  }
  // 카드는 날짜순으로 보여주고 순위(rank)도 그 순서로 붙인다
  chosen.sort((a, b) => (a.start < b.start ? -1 : 1));
  const picks: RankedPlan[] = chosen.map((p, i) => ({
    ...p,
    rank: i + 1,
    efficiency: +(p.rest / p.leave).toFixed(1),
  }));

  return {
    picks,
    leaveUsed: picks.reduce((s, p) => s + p.leave, 0), // 요약: 연차 사용량
    restTotal: picks.reduce((s, p) => s + p.rest, 0), // 요약: 총 쉬는 날
    count: picks.length, // 요약: 나눠 쓰는 횟수
  };
}
