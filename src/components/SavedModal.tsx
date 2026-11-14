import { useCallback, useEffect, useState } from "react";
import external from "../assets/icons/external.svg";
import { googleCalendarUrl, periodLabel } from "../lib/plan";
import type { Recommendation } from "../types/recommendation";

interface Props {
  recommendations: Recommendation[];
  /** 이 계획을 적용하기 전 남은 연차 */
  leaveDays: number;
  onClose: () => void;
}

/** 저장 완료 모달 ("계획을 저장했어요") */
export default function SavedModal({ recommendations: recs, leaveDays, onClose }: Props) {
  const single = recs.length === 1;
  const r = recs[0];
  const used = recs.reduce((a, x) => a + x.leaveUsed, 0);
  const totalDays = recs.reduce((a, x) => a + x.totalDays, 0);
  const remaining = leaveDays - used;
  const [closing, setClosing] = useState(false);

  // 퇴장 모션(180ms)이 끝난 뒤에 실제로 닫는다
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 180);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div className={`modal-overlay ${closing ? "is-closing" : ""}`} onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="saved-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="saved-title" className="modal__title">계획을 저장했어요</h2>
        <p className="modal__date">{single ? `${periodLabel(r)} · ${r.title}` : `${recs.length}개 일정 · 총 ${totalDays}일 휴식`}</p>
        <p className="modal__info">연차 사용 {used}일 · 사용 후 잔여 {remaining}일</p>
        {single && (
          <a className="modal__google" href={googleCalendarUrl(r)} target="_blank" rel="noopener noreferrer">
            Google 캘린더에 추가
            <img src={external} width={13} height={13} alt="" />
          </a>
        )}
        <button type="button" className="modal__close" onClick={close}>계속 확인하기</button>
        <p className="modal__notice">회사 연차 신청은 별도로 진행해주세요.</p>
      </div>
    </div>
  );
}
