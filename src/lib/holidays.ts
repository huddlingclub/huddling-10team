// 공휴일 데이터 공급 (브라우저에서 동작: JSON을 import 로 번들에 포함한다)
// - 형식: Holiday[] = { date: "YYYY-MM-DD", name }[]  (types/plan.ts 와 같은 형식)
// - 한 날짜에 공휴일이 둘 이상 겹치면 같은 date 로 항목을 여러 개 넣으면 된다. (예: 2025-05-05 어린이날·부처님오신날)
// - 새 연도를 지원하려면 src/data/holidays-YYYY.json 을 만들고 아래 BY_YEAR 에 한 줄 추가한다.
import type { Holiday } from "../types/plan";
import h2026 from "../data/holidays-2026.json";
import h2027 from "../data/holidays-2027.json";

const BY_YEAR: Record<number, Holiday[]> = {
  2026: h2026,
  2027: h2027,
};

/** 공휴일 데이터가 준비된 연도 */
export const SUPPORTED_YEARS: number[] = Object.keys(BY_YEAR).map(Number);

const yearOf = (iso: string) => Number(iso.slice(0, 4));

/** from~to(포함) 기간의 공휴일을 날짜순으로 돌려준다. 데이터가 없는 연도는 빠진다. */
export function getHolidays(from: string, to: string): Holiday[] {
  const out: Holiday[] = [];
  for (let y = yearOf(from); y <= yearOf(to); y++) {
    for (const h of BY_YEAR[y] ?? []) if (h.date >= from && h.date <= to) out.push(h);
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** 기간에 걸쳐 있는데 공휴일 데이터가 없는 연도. 비어 있지 않으면 화면에서 안내하면 좋다. */
export function missingHolidayYears(from: string, to: string): number[] {
  const out: number[] = [];
  for (let y = yearOf(from); y <= yearOf(to); y++) if (!BY_YEAR[y]) out.push(y);
  return out;
}

/** 해당 연도의 대체공휴일 개수 (로딩 화면의 "2027년엔 대체공휴일이 7번 있어요"용) */
export function countSubstituteHolidays(year: number): number {
  return (BY_YEAR[year] ?? []).filter((h) => h.name.startsWith("대체공휴일")).length;
}
