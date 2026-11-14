import { useMemo, useState } from "react";
import checkWhite from "../assets/icons/check-white.svg";
import radio from "../assets/icons/radio.svg";
import sparkle from "../assets/icons/sparkle.svg";
import { BackButton } from "../components/TopBar";
import { dotDate, md, weekdayOf } from "../lib/date";
import { periodLabel } from "../lib/plan";
import { breakdown, leaveLabel, pickInitial, shortName, sortByRest, stripCells } from "../lib/shortPlan";
import type { Recommendation, SearchCondition } from "../types/recommendation";
import { Button, DayCell, Toast } from "../ui";

interface Props {
  cond: SearchCondition;
  results: Recommendation[];
  onBack: () => void;
  onEditRange: () => void;
  onConfirm: (recs: Recommendation[], available: number) => void;
}

/** 05 결과 · 짧게 자주 — 연휴를 여러 개 골라 함께 쓴다 */
export default function ShortResultScreen({ cond, results, onBack, onEditRange, onConfirm }: Props) {
  const sorted = useMemo(() => sortByRest(results), [results]);
  const [selected, setSelected] = useState<string[]>(() => pickInitial(sorted, cond.leaveDays));
  const [toast, setToast] = useState<string>();

  const chosen = sorted.filter((r) => selected.includes(r.id));
  const used = chosen.reduce((a, r) => a + r.leaveUsed, 0);
  const totalDays = chosen.reduce((a, r) => a + r.totalDays, 0);
  const leaveDates = chosen.flatMap((r) => r.leaveDates);

  const toggle = (r: Recommendation) => {
    if (selected.includes(r.id)) return setSelected(selected.filter((x) => x !== r.id));
    const over = used + r.leaveUsed - cond.leaveDays;
    if (over > 0) return setToast(`연차가 ${over}개 모자라요`);
    setSelected([...selected, r.id]);
  };

  const subtitle = chosen.length === 0 ? "아래에서 쉬고 싶은 연휴를 골라보세요"
    : `${chosen.length > 1 ? `${chosen.length}번 나눠서` : "한 번에"} 쉬어요 · ${chosen.map(shortName).join("·")}`;

  return (
    <div className="screen screen--grey screen--result">
      <div className="nav3">
        <BackButton onClick={onBack} />
        <strong>나의 황금연휴</strong>
        <button type="button" className="nav3__action" onClick={onEditRange}>조건 변경</button>
      </div>

      <section className="panel20 r-summary">
        <span className="r-badge"><img src={sparkle} width={11} height={11} alt="" />내가 고른 쉬는 일정</span>
        <h2 className="sr-headline">남은 연차 {cond.leaveDays}일로, <em>총 {totalDays}일</em> 쉬어요</h2>
        <p>{subtitle}</p>
        <dl className="r-detail">
          <div><dt>쓸 연차</dt><dd className="blue">{leaveDates.length ? leaveDates.map(md).join(" · ") : "-"}</dd></div>
          <div><dt>사용 후 남는 연차</dt><dd>{cond.leaveDays - used}일</dd></div>
          <small>{dotDate(cond.start)} – {dotDate(cond.end)} 기준</small>
        </dl>
      </section>

      <div className="sr-head">
        <h3>{leaveLabel(sorted)}</h3>
        <span>긴 휴식순</span>
      </div>
      <p className="sr-sub">고른 일정 모두 함께 사용할 수 있어요</p>

      <ul className="sr-options">
        {sorted.map((r) => {
          const on = selected.includes(r.id);
          return (
            <li key={r.id}>
              <button type="button" className={`sr-opt ${on ? "is-on" : ""}`} role="checkbox" aria-checked={on} onClick={() => toggle(r)}>
                <span className="sr-opt__top">
                  <b>{r.title}</b>
                  <span>{r.totalDays}일 휴식</span>
                  {on
                    ? <i className="sr-opt__check"><img src={checkWhite} width={14} height={14} alt="" /></i>
                    : <img src={radio} width={24} height={24} alt="" />}
                </span>
                <span className="sr-opt__period">{periodLabel(r)}</span>
                <span className="sr-opt__leave">연차 {r.leaveUsed}일 · {r.leaveDates.map((d) => `${md(d)}(${weekdayOf(d)})`).join(", ")}</span>
                <span className="sr-strip">
                  {stripCells(r).map((c) => <DayCell key={c.iso} day={c.day} weekday={c.weekday} kind={c.kind} />)}
                </span>
                <span className="sr-opt__note">{breakdown(r)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="r-foot">주 5일 근무 · 대한민국 공휴일 기준<br />회사 휴무와 연차 만료일에 따라 달라질 수 있어요.</p>

      <div className="screen__cta">
        <Button disabled={chosen.length === 0} onClick={() => onConfirm(chosen, cond.leaveDays)}>
          {chosen.length ? `${chosen.length}개 일정으로 할게요` : "일정을 골라주세요"}
        </Button>
      </div>
      {toast && <div className="toast-wrap"><Toast message={toast} onClose={() => setToast(undefined)} /></div>}
    </div>
  );
}
