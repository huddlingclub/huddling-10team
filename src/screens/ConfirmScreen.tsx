import { useEffect, useState } from "react";
import external from "../assets/icons/external.svg";
import cheer from "../assets/illustrations/penguin-cheer.png";
import shadow from "../assets/illustrations/shadow.svg";
import { BackButton } from "../components/TopBar";
import { longDate } from "../lib/date";
import { googleCalendarUrl, periodLabel, planText } from "../lib/plan";
import SavedModal from "../components/SavedModal";
import type { Recommendation } from "../types/recommendation";
import { Button, Toast } from "../ui";

interface Props {
  rec: Recommendation;
  /** 이 계획을 적용하기 전에 남아 있던 연차 */
  available: number;
  onBack: () => void;
  /** 저장 완료 모달의 "계속 확인하기" → 첫 화면으로 */
  onHome?: () => void;
  onConfirm?: () => void;
}

export default function ConfirmScreen({ rec, available, onBack, onConfirm, onHome }: Props) {
  const [toast, setToast] = useState<string>();
  const [saved, setSaved] = useState(false);
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
        <Button onClick={() => { onConfirm?.(); setSaved(true); }}>확인</Button>
      </div>
      {saved && <SavedModal recommendations={[rec]} leaveDays={available} onClose={() => setSaved(false)} onContinue={onHome} />}
      {toast && <div className="toast-wrap"><Toast message={toast} onClose={() => setToast(undefined)} /></div>}
    </div>
  );
}
