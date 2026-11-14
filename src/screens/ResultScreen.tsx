import { useMemo, useState } from "react";
import Illustration from "../components/Illustration";
import { TopBar } from "../components/TopBar";
import { addDays, daysInMonth, dow, fmt, ym } from "../lib/date";
import { holidayName } from "../lib/sampleRecommend";
import type { Recommendation, SearchCondition } from "../types/recommendation";
import { Badge, Back, Card, DayCell, SmallButton, Toast, Check, Plus, type DayKind } from "../ui";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const dot = (s: string) => s.replace(/-/g, ".");

export default function ResultScreen({ cond, results, onBack, onEditRange, onSelect }:
  { cond: SearchCondition; results: Recommendation[]; onBack: () => void; onEditRange: () => void; onSelect?: (r: Recommendation) => void }) {
  const [focusId, setFocusId] = useState(results[0].id);
  const [picked, setPicked] = useState<string[]>([]);
  const [month, setMonth] = useState(ym(results[0].start));
  const [toast, setToast] = useState<string>();

  const used = results.filter((r) => picked.includes(r.id)).reduce((a, r) => a + r.leaveUsed, 0);
  const remain = cond.leaveDays - used;
  const active = results.filter((r) => picked.includes(r.id) || r.id === focusId);

  const focus = (r: Recommendation) => { setFocusId(r.id); setMonth(ym(r.start)); };
  const toggle = (r: Recommendation) => {
    if (picked.includes(r.id)) return setPicked(picked.filter((x) => x !== r.id));
    if (r.leaveUsed > remain) return setToast(`연차가 ${r.leaveUsed - remain}개 모자라요`);
    setPicked([...picked, r.id]);
    focus(r);
  };

  const [y, m] = month.split("-").map(Number);
  const cells = useMemo(() => {
    const first = dow(`${month}-01`);
    const list: (null | { iso: string; day: number })[] = Array(first).fill(null);
    for (let d = 1; d <= daysInMonth(y, m); d++) list.push({ iso: `${month}-${String(d).padStart(2, "0")}`, day: d });
    return list;
  }, [month, y, m]);

  const info = (iso: string): { kind: DayKind; label?: string; band: boolean } => {
    const rec = active.find((r) => iso >= r.start && iso <= r.end);
    const h = holidayName(iso);
    const w = dow(iso);
    if (rec?.leaveDates.includes(iso)) return { kind: "leave", label: "연차", band: true };
    if (h) return { kind: "holiday", label: h, band: !!rec };
    return { kind: w === 0 ? "sun" : w === 6 ? "sat" : "weekday", band: !!rec };
  };

  const startYm = ym(cond.start), endYm = ym(cond.end);
  const shift = (n: number) => setMonth(ym(addDays(`${month}-01`, n > 0 ? 32 : -1)));

  return (
    <div className="screen screen--grey screen--result">
      <div className="result__top">
        <TopBar title="나의 황금연휴 계획" onBack={onBack} />
        <Illustration size={72} className="result__illust" />
      </div>

      <Card>
        <div className="sum__row">
          <span className="sum__range">{dot(cond.start)} ~ {dot(cond.end)}</span>
          <SmallButton onClick={onEditRange}>기간 바꾸기</SmallButton>
        </div>
        <p className="sum__label">남은 연차</p>
        <p className="num">{remain}<small> / {cond.leaveDays}개</small></p>
      </Card>

      <Card>
        <div className="cal__head">
          <h3>{y}년 {m}월</h3>
          <div>
            <button type="button" className="ui-icon-btn" aria-label="이전 달" disabled={month <= startYm} onClick={() => shift(-1)}><Back /></button>
            <button type="button" className="ui-icon-btn cal__next" aria-label="다음 달" disabled={month >= endYm} onClick={() => shift(1)}><Back /></button>
          </div>
        </div>
        <div className="cal__grid cal__week">
          {WEEK.map((w, i) => <span key={w} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>{w}</span>)}
        </div>
        <div className="cal__grid">
          {cells.map((c, i) => (c ? <DayCell key={c.iso} day={c.day} {...info(c.iso)} /> : <span key={`b${i}`} />))}
        </div>
        <div className="legend">
          <span><i className="lg lg--leave" />연차 쓰는 날</span>
          <span><i className="lg lg--band" />연휴 구간</span>
          <span className="red">14 공휴일</span>
          <span className="blue">18 토요일</span>
        </div>
      </Card>

      <div className="list__head"><h3>추천 황금연휴</h3><span>효율 높은 순</span></div>
      <div className="stack">
        {results.map((r) => {
          const on = picked.includes(r.id);
          return (
            <div key={r.id} className="rec" onClick={() => focus(r)}>
              <Card focus={r.id === focusId}>
                <div className="card__head">
                  <button type="button" className="card__focus" aria-pressed={r.id === focusId}
                    onClick={(e) => { e.stopPropagation(); focus(r); }}>
                    <h3>{r.title}</h3>
                    <p className="card__sub">{fmt(r.start)} ~ {fmt(r.end)}</p>
                  </button>
                  <Badge>효율 {(r.totalDays / r.leaveUsed).toFixed(1)}배</Badge>
                </div>
                <div className="card__flow">
                  <span>연차 {r.leaveUsed}개</span><i>→</i><b>{r.totalDays}일 휴가</b>
                  <span className="grow" />
                  <SmallButton on={on} onClick={(e) => { e.stopPropagation(); toggle(r); }}>
                    {on ? <><Check />담음</> : <><Plus size={14} />담기</>}
                  </SmallButton>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      <p className="note">공휴일은 고정 날짜만 반영한 예시예요. 실제 데이터는 연동 예정입니다.</p>

      {/* 이 일정 선택 CTA */}
      {onSelect && (
        <div className="screen__cta">
          {picked.length > 0 ? (
            <button
              type="button"
              className="ui-btn"
              onClick={() => {
                const first = results.find((r) => picked[0] === r.id);
                if (first) onSelect(first);
              }}
            >
              이 일정 선택하기 ({picked.length}개)
            </button>
          ) : (
            <button type="button" className="ui-btn ui-btn--ghost" disabled>
              담기 버튼으로 일정을 선택해 주세요
            </button>
          )}
        </div>
      )}

      {toast && <div className="toast-wrap"><Toast message={toast} onClose={() => setToast(undefined)} /></div>}
    </div>
  );
}
