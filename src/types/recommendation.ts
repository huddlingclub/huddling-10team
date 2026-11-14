/** 온보딩 질문 1: 휴가 스타일 (길게 한 번 몰아서 / 짧게 자주) */
export type VacationStyle = "bulk" | "short";

export interface SearchCondition {
  leaveDays: number;
  start: string; // YYYY-MM-DD
  end: string;
  style: VacationStyle;
}

export interface Recommendation {
  id: string;
  title: string;
  start: string;
  end: string;
  leaveUsed: number;
  totalDays: number; // 쉬는 총 일수
  leaveDates: string[];
  holidayNames: string[];
  holidayDates: string[]; // 공휴일 날짜 (YYYY-MM-DD)
  label?: string; // e.g. "추석"
}
