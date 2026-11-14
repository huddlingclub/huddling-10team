// 날짜는 전부 "YYYY-MM-DD" 문자열로만 다룬다. (Date 객체를 밖으로 내보내지 않아 시간대 버그를 막음)
import type { Holiday } from "../types/plan";
import { addDays, diffDays, dow, parse, toIso } from "./date";

export type DayType = "holiday" | "weekend" | "workday";

export interface CalendarDay {
  date: string;
  dow: number; // 0=일
  names: string[];
  type: DayType;
}

export function isValid(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && toIso(parse(s)) === s;
}

/**
 * 기간의 모든 날짜를 만들고 종류를 붙인다.
 * holiday: 공휴일 (주말과 겹쳐도 공휴일) / weekend: 토·일 / workday: 연차를 쓸 수 있는 평일
 */
export function buildDays(from: string, to: string, holidays: Holiday[]): CalendarDay[] {
  if (!isValid(from) || !isValid(to) || from > to) return [];
  const byDate: Record<string, string[]> = {};
  for (const h of holidays ?? []) (byDate[h.date] ??= []).push(h.name);

  const n = diffDays(from, to);
  const days: CalendarDay[] = [];
  for (let i = 0; i <= n; i++) {
    const date = addDays(from, i);
    const w = dow(date);
    const names = byDate[date];
    days.push({
      date,
      dow: w,
      names: names ?? [],
      type: names ? "holiday" : w === 0 || w === 6 ? "weekend" : "workday",
    });
  }
  return days;
}
