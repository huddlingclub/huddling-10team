import { useState } from "react";
import external from "../assets/icons/external.svg";
import cheer from "../assets/illustrations/penguin-cheer.png";
import shadow from "../assets/illustrations/shadow.svg";
import SavedModal from "../components/SavedModal";
import { BackButton } from "../components/TopBar";
import { longDate } from "../lib/date";
import { googleCalendarUrl } from "../lib/plan";
import type { Recommendation } from "../types/recommendation";
import { Button } from "../ui";

interface Props {
  recs: Recommendation[];
  /** 이 계획을 적용하기 전 남은 연차 */
  available: number;
  onBack: () => void;
}

/** 07 휴가 계획 확인 · 짧게 자주 — 고른 연휴 여러 개를 한 번에 확인 */
export default function ShortConfirmScreen({ recs, available, onBack }: Props) {
  const [saved, setSaved] = useState(false);
  const n = recs.length;
  const total = recs.reduce((a, r) => a + r.totalDays, 0);
  const used = recs.reduce((a, r) => a + r.leaveUsed, 0);
  const years = [...new Set(recs.map((r) => r.start.slice(0, 4)))].sort();
  const yearLabel = years.length > 1 ? `${years[0]}~${years[years.length - 1]}년` : `${years[0]}년`;

  return (
    <div className="screen screen--grey screen--confirm">
      <div className="nav3">
        <BackButton onClick={onBack} />
        <strong>휴가 계획 확인</strong>
        <span />
      </div>

      <section className="panel24 hero">
        <h2 className="hero__h2--s"><em>총 {total}일</em> 쉬는 계획을 세웠어요</h2>
        <p>연차 {used}일을 {n > 1 ? `${n}번에 나눠` : "한 번에"} 써요 · {yearLabel}</p>
        <div className="hero__illust">
          <img src={cheer} width={180} height={176} alt="" />
          <img src={shadow} width={190} height={12} alt="" />
        </div>
      </section>

      <section className="panel24 leave">
        <div className="leave__head"><h3>신청할 연차</h3><span>총 {used}일</span></div>
        <ul>
          {recs.map((r) => (
            <li key={r.id} className="leave__plan">
              <span><b>{r.title}</b><small>{r.leaveDates.map(longDate).join(", ")}</small></span>
              <b className="blue">{r.leaveUsed}일</b>
            </li>
          ))}
        </ul>
        <div className="leave__left">
          <div><b>남는 연차</b><small>남은 {available}일 – 사용 {used}일</small></div>
          <strong>{available - used}일</strong>
        </div>
      </section>

      <section className="panel24 export">
        <h3>내 캘린더에도 넣어둘까요?</h3>
        <p>{n > 1 ? `${n}번의 휴식 기간을 각각 종일 일정으로 넣어요.` : "휴식 기간을 종일 일정으로 넣어요."}<br />연차 신청일은 일정 설명에 함께 적어둘게요.</p>
        <a className="export__btn" href={googleCalendarUrl(recs[0])} target="_blank" rel="noopener noreferrer">
          Google 캘린더에 추가
          <img src={external} width={13} height={13} alt="" />
        </a>
        {n > 1 && (
          // 구글 캘린더 링크는 한 번에 일정 하나만 만들 수 있어 나머지는 따로 연결한다
          <p className="export__more">
            나머지 일정도 추가:{" "}
            {recs.slice(1).map((r, i) => (
              <span key={r.id}>{i > 0 && " · "}<a href={googleCalendarUrl(r)} target="_blank" rel="noopener noreferrer">{r.title}</a></span>
            ))}
          </p>
        )}
      </section>

      <div className="cta2">
        <button type="button" className="ui-btn ui-btn--white" onClick={onBack}>다른 조합 보기</button>
        <Button onClick={() => setSaved(true)}>확인</Button>
      </div>
      {saved && <SavedModal recommendations={recs} leaveDays={available} onClose={() => setSaved(false)} />}
    </div>
  );
}
