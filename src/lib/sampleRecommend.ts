// ⚠️ 임시(placeholder) 추천 로직 — 와이어프레임 흐름 확인용.
// 실제 공휴일은 holidays API(담당자 별도), 실제 알고리즘은 lib/recommend 담당자가 대체한다.
// 여기서는 날짜가 고정된 공휴일만 사용한다 (설날·추석·대체공휴일 제외).
import type { Recommendation, SearchCondition } from "../types/recommendation";
import { addDays, diffDays, isWeekend, ym } from "./date";

const FIXED: Record<string, string> = {
  "01-01": "신정", "03-01": "삼일절", "05-05": "어린이날", "06-06": "현충일",
  "08-15": "광복절", "10-03": "개천절", "10-09": "한글날", "12-25": "성탄절",
};

export const holidayName = (iso: string): string | undefined => FIXED[iso.slice(5)];
export const isOff = (iso: string) => isWeekend(iso) || !!holidayName(iso);

const LEN_BY_STYLE = { bulk: [7, 11], balanced: [4, 6], short: [3, 4] } as const;
const MAX_LEAVE_BY_STYLE = { bulk: 99, balanced: 3, short: 2 } as const;

export function sampleRecommend(c: SearchCondition): Recommendation[] {
  const span = diffDays(c.start, c.end) + 1;
  const [minLen, maxLen] = LEN_BY_STYLE[c.style];
  const cands: Recommendation[] = [];

  for (let o = 0; o < span; o++) {
    const s = addDays(c.start, o);
    if (!isOff(s)) continue;
    for (let len = minLen; len <= maxLen && o + len <= span; len++) {
      const days = Array.from({ length: len }, (_, i) => addDays(s, i));
      const e = days[len - 1];
      if (!isOff(e)) continue;
      if (days.some((d) => c.avoidMonths.includes(ym(d)))) continue;
      const leaveDates = days.filter((d) => !isOff(d));
      const names = [...new Set(days.map(holidayName).filter((n): n is string => !!n))];
      if (!leaveDates.length || leaveDates.length > Math.min(c.leaveDays, MAX_LEAVE_BY_STYLE[c.style]) || !names.length) continue;
      cands.push({
        id: `${s}`, title: `${names[0]} 연휴`, start: s, end: e,
        leaveUsed: leaveDates.length, totalDays: len, leaveDates, holidayNames: names,
      });
    }
  }

  cands.sort((a, b) => b.totalDays / b.leaveUsed - a.totalDays / a.leaveUsed || b.totalDays - a.totalDays);
  const picked: Recommendation[] = [];
  for (const r of cands) {
    if (picked.some((p) => !(r.end < p.start || r.start > p.end))) continue;
    picked.push(r);
    if (picked.length >= 5) break;
  }
  return picked; // 효율 높은 순
}
