import type { Holiday } from "../types/holiday";

// 공공데이터포털 한국천문연구원 특일 정보 (공휴일/대체공휴일 조회)
const ENDPOINT =
  "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

const cache = new Map<string, Promise<Holiday[]>>();

const toIso = (locdate: number | string) => {
  const s = String(locdate);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

async function fetchMonth(year: number, month: number): Promise<Holiday[]> {
  const key = import.meta.env.VITE_HOLIDAY_API_KEY as string | undefined;
  if (!key) throw new Error("VITE_HOLIDAY_API_KEY is not set");

  const params = new URLSearchParams({
    solYear: String(year),
    solMonth: String(month).padStart(2, "0"),
    _type: "json",
    numOfRows: "50",
  });
  // serviceKey는 이미 인코딩된 키일 수 있어 직접 이어붙인다
  const res = await fetch(`${ENDPOINT}?serviceKey=${key}&${params}`);
  if (!res.ok) throw new Error(`Holiday API ${res.status}`);

  const json = await res.json();
  const items = json?.response?.body?.items?.item;
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items]; // 1건이면 객체로 옴
  return list
    .filter((i: { isHoliday: string }) => i.isHoliday === "Y")
    .map((i: { locdate: number; dateName: string }) => ({
      date: toIso(i.locdate),
      name: i.dateName,
    }));
}

/** 연도 전체 공휴일 (월별 병렬 호출, 연도 단위 캐시) */
export function getHolidaysByYear(year: number): Promise<Holiday[]> {
  if (!cache.has(year.toString())) {
    const p = Promise.all(
      Array.from({ length: 12 }, (_, i) => fetchMonth(year, i + 1)),
    ).then((r) => r.flat());
    p.catch(() => cache.delete(year.toString())); // 실패는 캐시하지 않음
    cache.set(year.toString(), p);
  }
  return cache.get(year.toString())!;
}

/** 기간(YYYY-MM-DD ~ YYYY-MM-DD) 내 공휴일. 여러 해에 걸쳐도 처리 */
export async function getHolidays(start: string, end: string): Promise<Holiday[]> {
  const y1 = Number(start.slice(0, 4));
  const y2 = Number(end.slice(0, 4));
  const years = Array.from({ length: y2 - y1 + 1 }, (_, i) => y1 + i);
  const all = (await Promise.all(years.map(getHolidaysByYear))).flat();
  return all
    .filter((h) => h.date >= start && h.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}
