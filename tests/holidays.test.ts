import { describe, expect, it } from "vitest";
import {
  SUPPORTED_YEARS,
  countSubstituteHolidays,
  getHolidays,
  missingHolidayYears,
} from "../src/lib/holidays";
import { buildDays } from "../src/lib/calendar";

describe("getHolidays", () => {
  it("2026·2027년 데이터를 지원한다", () => {
    expect(SUPPORTED_YEARS).toEqual([2026, 2027]);
  });

  it("2026-11-14 ~ 2026-12-31 에는 성탄절 하루뿐이다", () => {
    expect(getHolidays("2026-11-14", "2026-12-31")).toEqual([{ date: "2026-12-25", name: "성탄절" }]);
  });

  it("연도를 넘어도 날짜순으로 합쳐 준다", () => {
    const hs = getHolidays("2026-12-24", "2027-01-02");
    expect(hs.map((h) => h.date)).toEqual(["2026-12-25", "2027-01-01"]);
  });

  it("기간의 시작·끝 날짜도 포함한다", () => {
    expect(getHolidays("2027-05-01", "2027-05-01")).toHaveLength(1);
    expect(getHolidays("2027-05-05", "2027-05-05")).toHaveLength(1);
  });

  it("기간 안에 공휴일이 없으면 빈 배열", () => {
    expect(getHolidays("2027-06-07", "2027-07-16")).toEqual([]);
  });

  it("전체 개수: 2026년 22일, 2027년 24일", () => {
    expect(getHolidays("2026-01-01", "2026-12-31")).toHaveLength(22);
    expect(getHolidays("2027-01-01", "2027-12-31")).toHaveLength(24);
  });

  it("노동절(5/1)과 제헌절(7/17)이 두 해 모두 들어 있다", () => {
    for (const d of ["2026-05-01", "2026-07-17", "2027-05-01", "2027-07-17"]) {
      expect(getHolidays(d, d)).toHaveLength(1);
    }
  });

  it("모든 항목이 { date: YYYY-MM-DD, name } 형식이고 날짜가 중복되지 않는다", () => {
    const hs = getHolidays("2026-01-01", "2027-12-31");
    for (const h of hs) {
      expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(h.name.length).toBeGreaterThan(0);
    }
    expect(new Set(hs.map((h) => h.date)).size).toBe(hs.length); // 2026~27년은 겹치는 날이 없다
  });
});

describe("missingHolidayYears", () => {
  it("데이터가 있는 기간은 빈 배열", () => {
    expect(missingHolidayYears("2026-11-14", "2027-12-31")).toEqual([]);
  });
  it("데이터가 없는 연도를 알려 준다", () => {
    expect(missingHolidayYears("2027-12-01", "2028-02-01")).toEqual([2028]);
    expect(missingHolidayYears("2025-12-01", "2026-01-31")).toEqual([2025]);
  });
});

describe("countSubstituteHolidays", () => {
  it("2027년은 7번 (로딩 화면 문구와 같다)", () => {
    expect(countSubstituteHolidays(2027)).toBe(7);
  });
  it("2026년은 4번", () => {
    expect(countSubstituteHolidays(2026)).toBe(4);
  });
  it("데이터 없는 연도는 0", () => {
    expect(countSubstituteHolidays(2030)).toBe(0);
  });
});

describe("calendar.buildDays 와 함께 쓸 때", () => {
  const days = (from: string, to: string) => buildDays(from, to, getHolidays(from, to));
  const typeOf = (from: string, to: string, date: string) => days(from, to).find((d) => d.date === date)?.type;

  it("공휴일이 주말과 겹치면 holiday (2027 성탄절은 토요일)", () => {
    expect(typeOf("2027-12-24", "2027-12-28", "2027-12-25")).toBe("holiday");
    expect(typeOf("2027-12-24", "2027-12-28", "2027-12-26")).toBe("weekend");
    expect(typeOf("2027-12-24", "2027-12-28", "2027-12-27")).toBe("holiday"); // 대체공휴일
  });

  it("2027 설 연휴(2/6~2/9)는 연속 4일 holiday", () => {
    const t = days("2027-02-05", "2027-02-10").map((d) => d.type);
    expect(t).toEqual(["workday", "holiday", "holiday", "holiday", "holiday", "workday"]);
  });

  it("2027 추석(9/14~16)은 화~목 3일, 대체공휴일 없음", () => {
    const t = days("2027-09-13", "2027-09-17").map((d) => d.type);
    expect(t).toEqual(["workday", "holiday", "holiday", "holiday", "workday"]);
  });
});
