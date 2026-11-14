const pad = (n: number) => String(n).padStart(2, "0");

/** 로컬 시간 기준 YYYY-MM-DD */
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => toIso(new Date());
export const endOfThisYear = () => `${new Date().getFullYear()}-12-31`;

/** YYYY-MM-DD → M.D(요일) */
export function fmt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const w = "일월화수목금토"[new Date(y, m - 1, d).getDay()];
  return `${m}.${d}(${w})`;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toIso(new Date(y, m - 1, d + n));
}

export const diffDays = (a: string, b: string) => {
  const p = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((p(b) - p(a)) / 86400000);
};

export const ym = (iso: string) => iso.slice(0, 7);
export const parse = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
export const dow = (iso: string) => parse(iso).getDay(); // 0=일
export const isWeekend = (iso: string) => dow(iso) === 0 || dow(iso) === 6;
export const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
export const monthLabel = (ymStr: string) => `${Number(ymStr.slice(5))}월`;

/** 이번 달부터 count개월 (YYYY-MM) */
export function monthsFromNow(count: number): string[] {
  const n = new Date();
  return Array.from({ length: count }, (_, i) => ym(toIso(new Date(n.getFullYear(), n.getMonth() + i, 1))));
}

/** from~to(YYYY-MM) 사이 모든 달 */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

export const monthStart = (s: string) => `${s}-01`;
export const monthEnd = (s: string) => `${s}-${String(daysInMonth(Number(s.slice(0, 4)), Number(s.slice(5)))).padStart(2, "0")}`;
export const shiftMonth = (s: string, n: number) => {
  const [y, m] = s.split("-").map(Number);
  return ym(toIso(new Date(y, m - 1 + n, 1)));
};
