// 디자인(PDF) 예시 화면과 같은 결과가 나오는지 확인하는 통합 테스트
// 입력 조건: 2026년 11월 ~ 2027년 12월 (design 입력 화면의 기본 범위)
import { describe, expect, it } from "vitest";
import { getHolidays } from "../src/lib/holidays";
import { recommendByStyle } from "../src/lib/recommendByStyle";
import type { SearchCondition } from "../src/types/recommendation";

const START = "2026-11-01";
const END = "2027-12-31";
const run = (leaveDays: number, style: SearchCondition["style"]) =>
  recommendByStyle({ leaveDays, start: START, end: END, style, avoidMonths: [] }, getHolidays(START, END));

describe("몰아쓰기(bulk) · 연차 2개", () => {
  const r = run(2, "bulk");

  it("1위는 추석: 2027-09-11 ~ 09-19, 연차 2일로 9일 (디자인 결과 화면과 동일)", () => {
    const top = r.items[0];
    expect(top.start).toBe("2027-09-11");
    expect(top.end).toBe("2027-09-19");
    expect(top.leaveUsed).toBe(2);
    expect(top.totalDays).toBe(9);
    expect(top.leaveDates).toEqual(["2027-09-13", "2027-09-17"]); // 9.13(월) · 9.17(금)
    expect(top.holidayNames.join()).toContain("추석");
  });

  it("추천은 최대 4개이고 쉬는 날이 긴 순서다", () => {
    expect(r.items.length).toBeLessThanOrEqual(4);
    const rests = r.items.map((i) => i.totalDays);
    expect(rests).toEqual([...rests].sort((a, b) => b - a));
  });

  it("요약: 연차 2개 입력, 1위 기준 연차 2·휴가 9일", () => {
    expect(r.mode).toBe("combined");
    expect(r.summary.leaveTotal).toBe(2);
    expect(r.summary.leaveUsed).toBe(2);
    expect(r.summary.restTotal).toBe(9);
  });

  it("추천끼리 겹치거나 맞닿지 않는다", () => {
    const items = [...r.items].sort((a, b) => (a.start < b.start ? -1 : 1));
    for (let i = 1; i < items.length; i++) expect(items[i].start > items[i - 1].end).toBe(true);
  });

  it("모든 추천이 입력 기간 안에 있고, 연차가 입력값을 넘지 않는다", () => {
    for (const it of r.items) {
      expect(it.start >= START && it.end <= END).toBe(true);
      expect(it.leaveUsed).toBeLessThanOrEqual(2);
    }
  });
});

describe("몰아쓰기(bulk) · 연차 15개 (디자인 입력 화면의 기본값)", () => {
  const r = run(15, "bulk");
  it("추천 4개, 모두 연차 15개를 쓰고 20일 넘게 쉰다", () => {
    expect(r.items).toHaveLength(4);
    for (const it of r.items) {
      expect(it.leaveUsed).toBe(15);
      expect(it.totalDays).toBeGreaterThan(20);
    }
  });
});

describe("나눠쓰기(short) · 연차 5개", () => {
  const r = run(5, "short");
  it("연차를 정확히 5개 쓰고 추천 5개를 날짜순으로 준다", () => {
    expect(r.mode).toBe("split");
    expect(r.summary.leaveUsed).toBe(5);
    expect(r.items).toHaveLength(5);
    const starts = r.items.map((i) => i.start);
    expect(starts).toEqual([...starts].sort());
  });
  it("각 추천은 연차 1개로 3일 이상 쉰다", () => {
    for (const it of r.items) {
      expect(it.leaveUsed).toBe(1);
      expect(it.totalDays).toBeGreaterThanOrEqual(3);
    }
  });
  it("가장 이득인 자리(추석 6일)가 포함된다", () => {
    expect(r.items.some((i) => i.start === "2027-09-11" && i.end === "2027-09-16" && i.totalDays === 6)).toBe(true);
  });
  it("총 쉬는 날은 추천들의 합과 같다", () => {
    expect(r.summary.restTotal).toBe(r.items.reduce((s, i) => s + i.totalDays, 0));
  });
});

describe("2026-11-14 부터 보는 서비스 시작 시점", () => {
  it("11/14부터 12/31까지만 보면 공휴일은 성탄절 하루, 나눠쓰기로 12/24 연차 추천이 나온다", () => {
    const start = "2026-11-14";
    const end = "2026-12-31";
    const r = recommendByStyle({ leaveDays: 3, start, end, style: "short", avoidMonths: [] }, getHolidays(start, end));
    const xmas = r.items.find((i) => i.holidayNames.includes("성탄절"));
    expect(xmas?.start).toBe("2026-12-24");
    expect(xmas?.end).toBe("2026-12-27");
    expect(xmas?.totalDays).toBe(4);
  });
});

describe("예외 입력", () => {
  it("연차 0개면 빈 결과", () => {
    expect(run(0, "bulk").items).toEqual([]);
    expect(run(0, "short").items).toEqual([]);
  });
  it("시작일이 종료일보다 늦으면 빈 결과", () => {
    const r = recommendByStyle(
      { leaveDays: 3, start: "2027-12-31", end: "2026-11-01", style: "bulk", avoidMonths: [] },
      [],
    );
    expect(r.items).toEqual([]);
  });
});
