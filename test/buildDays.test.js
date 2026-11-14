import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDays, loadHolidayMap } from '../src/buildDays.js';

const find = (days, date) => days.find((d) => d.date === date);
const build = (start, end) => {
  const { holidayMap } = loadHolidayMap(start, end);
  return buildDays(start, end, holidayMap);
};

test('하루짜리 기간도 1개를 반환한다', () => {
  const days = buildDays('2026-11-16', '2026-11-16');
  assert.equal(days.length, 1);
  assert.equal(days[0].type, '평일'); // 월요일
});

test('토·일은 주말, 월~금은 평일로 분류한다', () => {
  const days = buildDays('2026-11-13', '2026-11-17'); // 금토일월화
  assert.deepEqual(
    days.map((d) => d.type),
    ['평일', '주말', '주말', '평일', '평일'],
  );
});

test('공휴일은 공휴로 분류하고 이름을 붙인다', () => {
  const map = new Map([['2026-12-25', '성탄절']]); // 금요일
  const d = find(buildDays('2026-12-24', '2026-12-26', map), '2026-12-25');
  assert.equal(d.type, '공휴');
  assert.equal(d.name, '성탄절');
});

test('공휴일이 주말과 겹치면 공휴가 우선한다 (2027 성탄절은 토요일)', () => {
  const days = build('2027-12-25', '2027-12-27');
  assert.equal(days[0].type, '공휴'); // 토요일이지만 성탄절
  assert.equal(days[1].type, '주말'); // 일요일
  assert.equal(days[2].type, '공휴'); // 대체공휴일
});

test('노동절(5/1)은 공휴로 처리된다 (2026 금요일, 2027 토요일)', () => {
  assert.equal(find(build('2026-05-01', '2026-05-01'), '2026-05-01').name, '노동절');
  assert.equal(find(build('2027-05-01', '2027-05-03'), '2027-05-01').type, '공휴');
  assert.equal(find(build('2027-05-01', '2027-05-03'), '2027-05-03').type, '공휴'); // 대체
});

test('연도가 바뀌어도 날짜가 연속되고 두 해 데이터가 모두 적용된다', () => {
  const days = build('2026-12-30', '2027-01-02');
  assert.deepEqual(
    days.map((d) => d.date),
    ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'],
  );
  assert.deepEqual(
    days.map((d) => d.type),
    ['평일', '평일', '공휴', '주말'],
  );
});

test('윤년 2월 29일이 포함된다 (2024)', () => {
  const days = buildDays('2024-02-28', '2024-03-01');
  assert.deepEqual(
    days.map((d) => d.date),
    ['2024-02-28', '2024-02-29', '2024-03-01'],
  );
});

test('2026-11-14 ~ 2026-12-31: 48일, 공휴는 성탄절 1일', () => {
  const days = build('2026-11-14', '2026-12-31');
  assert.equal(days.length, 48);
  const holidays = days.filter((d) => d.type === '공휴');
  assert.equal(holidays.length, 1);
  assert.equal(holidays[0].date, '2026-12-25');
  assert.equal(holidays[0].name, '성탄절');
});

test('2026년 전체: 365일, 공휴 22일', () => {
  const days = build('2026-01-01', '2026-12-31');
  assert.equal(days.length, 365);
  assert.equal(days.filter((d) => d.type === '공휴').length, 22);
});

test('2027년 전체: 365일, 공휴 24일', () => {
  const days = build('2027-01-01', '2027-12-31');
  assert.equal(days.length, 365);
  assert.equal(days.filter((d) => d.type === '공휴').length, 24);
});

test('2027 설 연휴(2/6~2/9)는 연속 4일 공휴, 앞뒤는 평일', () => {
  const days = build('2027-02-05', '2027-02-10');
  assert.deepEqual(
    days.map((d) => d.type),
    ['평일', '공휴', '공휴', '공휴', '공휴', '평일'],
  );
});

test('2027 추석(9/14~16)은 화~목 3일, 대체공휴일 없음', () => {
  const days = build('2027-09-13', '2027-09-17');
  assert.deepEqual(
    days.map((d) => d.type),
    ['평일', '공휴', '공휴', '공휴', '평일'],
  );
});

test('시작일이 종료일보다 늦으면 RangeError', () => {
  assert.throws(() => buildDays('2026-12-31', '2026-11-14'), RangeError);
});

test('날짜 형식이 틀리면 TypeError', () => {
  assert.throws(() => buildDays('2026/11/14', '2026-11-15'), TypeError);
  assert.throws(() => buildDays('2026-1-1', '2026-01-02'), TypeError);
});

test('존재하지 않는 날짜(2026-02-30)는 TypeError', () => {
  assert.throws(() => buildDays('2026-02-30', '2026-03-01'), TypeError);
});

test('공휴일 데이터가 없는 연도는 missingYears로 알려준다', () => {
  const { holidayMap, missingYears } = loadHolidayMap('2027-12-01', '2028-01-31');
  assert.deepEqual(missingYears, [2028]);
  assert.ok(holidayMap.has('2027-12-25'));
});

test('데이터가 없어도 buildDays는 주말/평일로 동작한다', () => {
  const { holidayMap } = loadHolidayMap('2030-01-01', '2030-01-07');
  const days = buildDays('2030-01-01', '2030-01-07', holidayMap);
  assert.equal(days.length, 7);
  assert.ok(days.every((d) => d.type !== '공휴'));
});
