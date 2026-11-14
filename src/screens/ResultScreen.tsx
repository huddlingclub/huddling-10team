import { useMemo, useState } from "react";
import chevronLeft from "../assets/icons/chevron-left.svg";
import chevronRight from "../assets/icons/chevron-right.svg";
import sparkle from "../assets/icons/sparkle.svg";
import { BackButton } from "../components/TopBar";
import { daysInMonth, dotDate, dow, shortDateWd, shiftMonth, ym } from "../lib/date";
import { periodLabel, pickLongest } from "../lib/plan";
import { holidayName } from "../lib/sampleRecommend";
import type { Recommendation, SearchCondition } from "../types/recommendation";
import { Button } from "../ui";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  cond: SearchCondition;
  results: Recommendation[];
  onBack: () => void;
  onEditRange: () => void;
  onConfirm: (rec: Recommendation, available: number) => void;
}

export default function ResultScreen({ cond, results, onBack, onEditRange, onConfirm }: Props) {
  const longest = useMemo(() => pickLongest(results), [results]);
  const [focusId, setFocusId] = useState(longest.id);
  const rec = results.find((r) => r.id === focusId) ?? longest;
  const [month, setMonth] = useState(ym(rec.start));
  const others = results.filter((r) => r.id !== rec.id);

  const select = (r: Recommendation) => { setFocusId(r.id); setMonth(ym(r.start)); };

  const [y, m] = month.split("-").map(Number);
  const cells = useMemo(() => {
    const list: (null | string)[] = Array(dow(`${month}-01`)).fill(null);
    for (let d = 1; d <= daysInMonth(y, m); d++) list.push(`${month}-${String(d).padStart(2, "0")}`);
    return list;
  }, [month, y, m]);

  // 이번 달에 걸친 공휴일 안내 (예: 14–16일 추석)
  const holidayNotes = cells
    .filter((iso): iso is string => !!iso && iso >= rec.start && iso <= rec.end && !!holidayName(iso))
    .map((iso) => `${Number(iso.slice(8))}일 ${holidayName(iso)}`);

  const available = cond.leaveDays;
  const startYm = ym(cond.start), endYm = ym(cond.end);

  return (
    <div className="screen screen--grey screen--result">
      <div className="nav3">
        <BackButton onClick={onBack} />
        <strong>나의 황금연휴</strong>
        <button type="button" className="nav3__action" onClick={onEditRange}>조건 변경</button>
      </div>

      <section className="panel20 r-summary">
        <span className="r-badge">
          <img src={sparkle} width={11} height={11} alt="" />
          {rec.id === longest.id ? "가장 길게 쉬는 추천" : "선택한 추천"}
        </span>
        <h2>연차 {rec.leaveUsed}일로, <em>{rec.totalDays}일</em> 쉬어요</h2>
        <p>{periodLabel(rec)} · {rec.title}</p>
        <dl className="r-detail">
          <div><dt>쓸 연차</dt><dd className="blue">{rec.leaveDates.map(shortDateWd).join(" · ")}</dd></div>
          <div><dt>사용 후 남는 연차</dt><dd>{available - rec.leaveUsed}일</dd></div>
        </dl>
      </section>

      <section className="panel24 r-cal">
        <div className="r-cal__head">
          <h3>{y}년 {m}월</h3>
          <div>
            <button type="button" aria-label="이전 달" disabled={month <= startYm} onClick={() => setMonth(shiftMonth(month, -1))}>
              <img src={chevronLeft} width={20} height={20} alt="" />
            </button>
            <button type="button" aria-label="다음 달" disabled={month >= endYm} onClick={() => setMonth(shiftMonth(month, 1))}>
              <img src={chevronRight} width={20} height={20} alt="" />
            </button>
          </div>
        </div>
        <div className="r-cal__grid r-cal__week">
          {WEEK.map((w, i) => <span key={w} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>{w}</span>)}
        </div>
        <div className="r-cal__grid">
          {cells.map((iso, i) => {
            if (!iso) return <span key={`b${i}`} className="r-cell" />;
            const w = dow(iso);
            const inRange = iso >= rec.start && iso <= rec.end;
            const leave = rec.leaveDates.includes(iso);
            const tone = holidayName(iso) || w === 0 ? "red" : w === 6 ? "blue" : "";
            return (
              <span key={iso} className={`r-cell ${inRange ? "is-band" : ""} ${tone}`}>
                {leave ? <b className="r-cell__sel">{Number(iso.slice(8))}</b> : Number(iso.slice(8))}
              </span>
            );
          })}
        </div>
        <hr />
        <div className="r-legend">
          <span><i className="lg lg--leave" />쓸 연차</span>
          <span><i className="lg lg--band" />쉬는 기간</span>
          {holidayNotes.length > 0 && <b>{holidayNotes.join(", ")}</b>}
        </div>
      </section>

      <section className="r-remain">
        <div>
          <p>남은 연차</p>
          <small>{dotDate(cond.start)} – {dotDate(cond.end)} 기준</small>
        </div>
        <strong>{available}일</strong>
      </section>

      {others.length > 0 && (
        <>
          <h3 className="r-others__title">다른 추천 일정</h3>
          <p className="r-others__desc">공휴일과 주말을 이어 쉬어보세요</p>
          <ul className="r-others">
            {others.map((r) => (
              <li key={r.id}>
                <button type="button" className="r-row" onClick={() => select(r)}>
                  <span className="r-row__left"><b>{r.title}</b><span>{periodLabel(r)}</span></span>
                  <span className="r-row__right"><b>{r.totalDays}일 휴식</b><span>연차 {r.leaveUsed}일 사용</span></span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="r-foot">주 5일 근무 · 대한민국 공휴일 기준<br />회사 휴무와 연차 만료일에 따라 달라질 수 있어요.</p>

      <div className="screen__cta"><Button onClick={() => onConfirm(rec, available)}>이 일정 복사하기</Button></div>
    </div>
  );
}
