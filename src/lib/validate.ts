import type { SearchCondition } from "../types/recommendation";

export type FormErrors = Partial<Record<"leaveDays" | "start" | "end", string>>;

export function validate(c: SearchCondition): FormErrors {
  const e: FormErrors = {};
  if (!Number.isInteger(c.leaveDays) || c.leaveDays < 1) e.leaveDays = "연차는 1일 이상 입력해 주세요.";
  if (!c.start) e.start = "시작일을 선택해 주세요.";
  if (!c.end) e.end = "종료일을 선택해 주세요.";
  if (c.start && c.end && c.start > c.end) e.start = "시작일은 종료일보다 늦을 수 없어요.";
  return e;
}
