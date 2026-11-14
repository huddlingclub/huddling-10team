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
}
