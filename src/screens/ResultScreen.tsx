import { useEffect, useMemo, useState } from "react";
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
  const [dir, setDir] = useState<"next" | "prev">("next"); // 캘린더 슬라이드 방향
  const [entered, setEntered] = useState(false); // 첫 등장 모션은 한 번만
  const [swapped, setSwapped] = useState(false); // 다른 일정을 고른 뒤에만 교체 모션
  useEffect(() => { const t = setTimeout(() => setEntered(true), 900); return () => clearTimeout(t); }, []);
  const go = (m: string) => { setDir(m > month ? "next" : "prev"); setMonth(m); };
  const others = results.filter((r) => r.id !== rec.id);

  const select = (r: Recommendation) => {
    setFocusId(r.id);
    setSwapped(true);
    go(ym(r.start));
    // 선택한 일정이 위쪽 요약/캘린더에 반영되므로 맨 위로 부드럽게 올려준다 (모션 줄이기 설정이면 즉시)
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  };


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

      <section key={rec.id} className={`panel20 r-summary ${entered ? (swapped ? "r-swap" : "") : "r-enter"}`} style={{ "--i": 0 } as React.CSSProperties}>
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

      <section className={`panel24 r-cal ${entered ? "" : "r-enter"}`} style={{ "--i": 1 } as React.CSSProperties}>
        <div className="r-cal__head">
          <h3>{y}년 {m}월</h3>
          <div>
            <button type="button" aria-label="이전 달" disabled={month <= startYm} onClick={() => go(shiftMonth(month, -1))}>
              <img src={chevronLeft} width={20} height={20} alt="" />
            </button>
            <button type="button" aria-label="다음 달" disabled={month >= endYm} onClick={() => go(shiftMonth(month, 1))}>
              <img src={chevronRight} width={20} height={20} alt="" />
            </button>
          </div>
        </div>
        <div className="r-cal__grid r-cal__week">
          {WEEK.map((w, i) => <span key={w} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>{w}</span>)}
        </div>
        <div key={`${rec.id}-${month}`} className={`r-cal__grid r-slide r-slide--${dir}`}>
          {cells.map((iso, i) => {
            if (!iso) return <span key={`b${i}`} className="r-cell" />;
            const w = dow(iso);
            const inRange = iso >= rec.start && iso <= rec.end;
            const leave = rec.leaveDates.includes(iso);
            const tone = holidayName(iso) || w === 0 ? "red" : w === 6 ? "blue" : "";
            return (
              <span key={iso} className={`r-cell ${inRange ? "is-band" : ""} ${tone}`}>
                {leave ? <b className="r-cell__sel" style={{ "--d": rec.leaveDates.indexOf(iso) } as React.CSSProperties}>{Number(iso.slice(8))}</b> : Number(iso.slice(8))}
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

      <section className={`r-remain ${entered ? "" : "r-enter"}`} style={{ "--i": 2 } as React.CSSProperties}>
        <div>
          <p>남은 연차</p>
          <small>{dotDate(cond.start)} – {dotDate(cond.end)} 기준</small>
        </div>
        <strong>{available}일</strong>
      </section>

      {others.length > 0 && (
        <>
          <h3 className={`r-others__title ${entered ? "" : "r-enter"}`} style={{ "--i": 3 } as React.CSSProperties}>다른 추천 일정</h3>
          <p className="r-others__desc">공휴일과 주말을 이어 쉬어보세요</p>
          <ul className={`r-others ${entered ? "" : "r-enter"}`} style={{ "--i": 4 } as React.CSSProperties}>
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

      <p className={`r-foot ${entered ? "" : "r-enter"}`} style={{ "--i": 5 } as React.CSSProperties}>주 5일 근무 · 대한민국 공휴일 기준<br />회사 휴무와 연차 만료일에 따라 달라질 수 있어요.</p>

      <div className="screen__cta"><Button onClick={() => onConfirm(rec, available)}>이 일정 복사하기</Button></div>
    </div>
  );
}
