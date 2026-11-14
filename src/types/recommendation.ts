export type VacationStyle = "wonkiok" | "dandta";

export interface SearchCondition {
  leaveDays: number;
  start: string; // YYYY-MM-DD
  end: string;
  style: VacationStyle;
}

export interface Recommendation {
  id: string;
  start: string;
  end: string;
  leaveUsed: number;
  totalDays: number; // 쉬는 총 일수
  holidayNames: string[];
  leaveDates: string[]; // 실제 연차 사용일 (YYYY-MM-DD)
  holidayDates: string[]; // 공휴일 날짜 (YYYY-MM-DD)
  label?: string; // e.g. "추석"
}
