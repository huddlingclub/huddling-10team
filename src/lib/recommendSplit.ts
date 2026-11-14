// 나눠쓰기 베스트: 연차를 1개씩 쪼개 쓸 때, 총 쉬는 날이 최대가 되는 서로 안 겹치는 공휴일 연휴 자리의 조합.
// 후보는 연차 1개짜리 구간뿐이고, 연차가 남으면 고른 자리의 반대편에 1개씩 더 붙인다 (fillLeftover).
// 연휴 후보끼리는 겹치거나 맞닿으면 안 된다(사이에 평일이 최소 하루 있어야 별개의 연휴).
// 겹침이 있으므로 "구간 스케줄링 + 연차 예산" DP로 푼다.
// 점수 = 쉬는 날*1000 - 연차 → 쉬는 날이 같으면 연차를 덜 쓰는 쪽을 고른다.
import type { Plan, PlanParams, RankedPlan, SplitResult } from "../types/plan";
import { toCard } from "./buildCandidates";
import { buildDays } from "./calendar";
import { addDays } from "./date";

const touching = (a: { s: number; e: number }, b: { s: number; e: number }) => a.s <= b.e + 1 && b.s <= a.e + 1;

/**
 * 남는 연차 채우기: 이미 고른 자리마다 "반대편"에 평일 1개를 더 붙여 연휴를 늘린다. (한 자리당 최대 1번)
 * - 늘어나는 쉬는 날이 많은 순 → 빠른 날짜 순으로 남는 연차가 없어질 때까지 적용
 * - 같은 자리의 양쪽이 똑같이 이득이면, 이미 쓴 연차의 반대쪽에 붙인다 (금요일 연차면 월요일, 월요일 연차면 금요일)
 * - 늘린 구간이 다른 추천과 맞닿으면 제외 / 기간 밖으로는 못 나감
 */
function fillLeftover(picks: Plan[], leftover: number, params: PlanParams): Plan[] {
  const days = buildDays(params.from, params.to, params.holidays);
  const idx = new Map(days.map((d, i) => [d.date, i] as const));
  const wins = picks.map((p) => ({ s: idx.get(p.start)!, e: idx.get(p.end)!, leave: p.leave, plan: p }));
  const done = new Set<number>();

  while (leftover > 0) {
    type Cand = { pi: number; s: number; e: number; gain: number; pref: number };
    const cands: Cand[] = [];
    wins.forEach((w, pi) => {
      if (done.has(pi)) return;
      const lastIsLeave = w.plan.leaveDates.includes(w.plan.end);
      // 왼쪽(앞) 연장
      let k = w.s - 1;
      if (k >= 0 && days[k].type === "workday") {
        let ns = k;
        while (ns - 1 >= 0 && days[ns - 1].type !== "workday") ns--;
        cands.push({ pi, s: ns, e: w.e, gain: w.s - ns, pref: lastIsLeave ? 0 : 1 });
      }
      // 오른쪽(뒤) 연장
      k = w.e + 1;
      if (k < days.length && days[k].type === "workday") {
        let ne = k;
        while (ne + 1 < days.length && days[ne + 1].type !== "workday") ne++;
        cands.push({ pi, s: w.s, e: ne, gain: ne - w.e, pref: lastIsLeave ? 1 : 0 });
      }
    });
    const ok = cands
      .filter((c) => !wins.some((o, oi) => oi !== c.pi && touching(c, o)))
      .sort((a, b) => b.gain - a.gain || wins[a.pi].s - wins[b.pi].s || a.pref - b.pref);
    if (!ok.length) break;
    const c = ok[0];
    const w = wins[c.pi];
    w.s = c.s;
    w.e = c.e;
    w.leave += 1;
    w.plan = toCard(days, c.s, c.e, w.leave);
    done.add(c.pi);
    leftover -= 1;
  }
  return wins.map((w) => w.plan);
}

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
  // 연차가 남으면 고른 자리의 반대편에 붙여 연휴를 늘린다
  const used = chosen.reduce((s, p) => s + p.leave, 0);
  const finalPlans = fillLeftover(chosen, N - used, params);
  // 카드는 날짜순으로 보여주고 순위(rank)도 그 순서로 붙인다
  finalPlans.sort((a, b) => (a.start < b.start ? -1 : 1));
  const picks: RankedPlan[] = finalPlans.map((p, i) => ({
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
