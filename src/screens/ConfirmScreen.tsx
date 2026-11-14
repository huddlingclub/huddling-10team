import { useEffect, useState } from "react";
import external from "../assets/icons/external.svg";
import cheer from "../assets/illustrations/penguin-cheer.png";
import shadow from "../assets/illustrations/shadow.svg";
import { BackButton } from "../components/TopBar";
import { addDays, dotDateWd, longDate } from "../lib/date";
import { periodLabel, planText } from "../lib/plan";
import type { Recommendation } from "../types/recommendation";
import { Button, Toast } from "../ui";

const ymd = (iso: string) => iso.replace(/-/g, "");

/** 구글 캘린더 '일정 만들기' 링크 (종일 일정, 종료일은 다음 날 기준) */
function googleCalendarUrl(rec: Recommendation) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${rec.title} (${rec.totalDays}일)`,
    dates: `${ymd(rec.start)}/${ymd(addDays(rec.end, 1))}`,
    details: `연차 신청일: ${rec.leaveDates.map(longDate).join(", ")}`,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

interface Props {
  rec: Recommendation;
  /** 이 계획을 적용하기 전에 남아 있던 연차 */
  available: number;
  onBack: () => void;
  onConfirm?: () => void;
}

export default function ConfirmScreen({ rec, available, onBack, onConfirm }: Props) {
  const [toast, setToast] = useState<string>();
  useEffect(() => {
    // 05에서 "이 일정 복사하기"로 넘어오면 일정 문구를 클립보드에 복사 (실패해도 흐름은 계속)
    navigator.clipboard?.writeText(planText(rec)).then(() => setToast("일정을 복사했어요"), () => {});
  }, [rec]);

  return (
    <div className="screen screen--grey screen--confirm">
      <div className="nav3">
        <BackButton onClick={onBack} />
        <strong>휴가 계획 확인</strong>
        <span />
      </div>

      <section className="panel24 hero">
        <h2><em>{rec.totalDays}일</em> 휴가를 확보했어요</h2>
        <p>{periodLabel(rec)} · {rec.title}</p>
        <div className="hero__illust">
          <img src={cheer} width={180} height={176} alt="" />
          <img src={shadow} width={190} height={12} alt="" />
        </div>
      </section>

      <section className="panel24 leave">
        <div className="leave__head"><h3>신청할 연차</h3><span>총 {rec.leaveUsed}일</span></div>
        <ul>
          {rec.leaveDates.map((d) => (
            <li key={d}><span>{longDate(d)}</span><b>1일</b></li>
          ))}
        </ul>
        <div className="leave__left">
          <div><b>남는 연차</b><small>남은 {available}일 – 사용 {rec.leaveUsed}일</small></div>
          <strong>{available - rec.leaveUsed}일</strong>
        </div>
      </section>

      <section className="panel24 export">
        <h3>내 캘린더에도 넣어둘까요?</h3>
        <p>{rec.totalDays}일 휴식 기간을 종일 일정으로 넣어요.<br />연차 신청일은 일정 설명에 함께 적어둘게요.</p>
        <a className="export__btn" href={googleCalendarUrl(rec)} target="_blank" rel="noopener noreferrer">
          Google 캘린더에 추가
          <img src={external} width={13} height={13} alt="" />
        </a>
      </section>

      <div className="cta2">
        <button type="button" className="ui-btn ui-btn--white" onClick={onBack}>다른 일정 고르기</button>
        {/* TODO: 확정 후 동작(저장/공유 등)은 기획 확정 시 연결 */}
        <Button onClick={() => { onConfirm?.(); setToast("휴가 계획을 확인했어요"); }}>확인</Button>
      </div>
      {toast && <div className="toast-wrap"><Toast message={toast} onClose={() => setToast(undefined)} /></div>}
    </div>
  );
}
