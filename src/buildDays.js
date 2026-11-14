import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * "YYYY-MM-DD" → UTC 자정 timestamp.
 * 시간대 문제를 피하려고 항상 UTC 기준으로만 계산한다.
 */
function parseDate(str) {
  const m = DATE_RE.exec(str);
  if (!m) throw new TypeError(`날짜 형식이 올바르지 않습니다: ${str}`);
  const [, y, mo, d] = m.map(Number);
  const ts = Date.UTC(y, mo - 1, d);
  const back = new Date(ts);
  // 2025-02-30 같은 존재하지 않는 날짜 걸러내기
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) {
    throw new TypeError(`존재하지 않는 날짜입니다: ${str}`);
  }
  return ts;
}

/** timestamp → "YYYY-MM-DD" (toISOString 쓰지 않음) */
function formatDate(ts) {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 시작일~종료일(포함)을 하루씩 { date, type, name? } 배열로 만든다.
 * type 우선순위: 공휴 > 주말 > 평일 (공휴일이 주말과 겹치면 '공휴')
 *
 * @param {string} start "YYYY-MM-DD"
 * @param {string} end   "YYYY-MM-DD"
 * @param {Map<string,string>} holidayMap "YYYY-MM-DD" → 공휴일 이름
 * @returns {{date:string, type:'평일'|'주말'|'공휴', name?:string}[]}
 */
export function buildDays(start, end, holidayMap = new Map()) {
  const s = parseDate(start);
  const e = parseDate(end);
  if (s > e) throw new RangeError('시작일이 종료일보다 늦습니다.');

  const days = [];
  for (let ts = s; ts <= e; ts += DAY_MS) {
    const date = formatDate(ts);
    const dow = new Date(ts).getUTCDay(); // 0=일, 6=토
    if (holidayMap.has(date)) {
      days.push({ date, type: '공휴', name: holidayMap.get(date) });
    } else if (dow === 0 || dow === 6) {
      days.push({ date, type: '주말' });
    } else {
      days.push({ date, type: '평일' });
    }
  }
  return days;
}

const HOLIDAY_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'holidays');

/**
 * 기간에 걸친 모든 연도의 공휴일 JSON을 읽어 Map으로 합친다.
 * 파일이 없는 연도는 에러 대신 missingYears에 담아 돌려준다.
 *
 * @returns {{holidayMap: Map<string,string>, missingYears: number[]}}
 */
export function loadHolidayMap(start, end, dir = HOLIDAY_DIR) {
  const startYear = Number(start.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  const holidayMap = new Map();
  const missingYears = [];

  for (let year = startYear; year <= endYear; year++) {
    const file = path.join(dir, `holidays-${year}.json`);
    if (!existsSync(file)) {
      missingYears.push(year);
      continue;
    }
    const data = JSON.parse(readFileSync(file, 'utf8'));
    for (const [date, name] of Object.entries(data)) holidayMap.set(date, name);
  }
  return { holidayMap, missingYears };
}
