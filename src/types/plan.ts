/** 공휴일 담당이 넘겨주는 값 */
export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

/** 추천 알고리즘 입력 */
export interface PlanParams {
  leaveCount: number;
  from: string; // YYYY-MM-DD
  to: string;
  holidays: Holiday[];
}

/** 화면 칸 나열용: 연차 / 공휴일 / 주말 */
export type CellType = "leave" | "holiday" | "weekend";
export interface PlanDay {
  date: string;
  type: CellType;
}

/** 연차를 이렇게 쓰면 이렇게 쉰다는 구간 하나 */
export interface Plan {
  title: string;
  label: string;
  start: string;
  end: string;
  leave: number; // 쓰는 연차 수
  rest: number; // 연속으로 쉬는 총 일수
  efficiency: number; // rest / leave (소수 1자리)
  leaveDates: string[];
  holidays: string[];
  days: PlanDay[];
  tip: string;
}

export type RankedPlan = Plan & { rank: number };

export interface CombinedSummary {
  leaveCount: number;
  maxRest: number;
  count: number;
}

export interface SplitResult {
  picks: RankedPlan[];
  leaveUsed: number;
  restTotal: number;
  count: number;
}
