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
