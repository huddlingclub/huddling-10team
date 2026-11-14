import type { Recommendation } from "../types/recommendation";

interface Props {
  recommendation: Recommendation;
  leaveDays: number;
  onClose: () => void;
}

export default function SavedModal({ recommendation: r, leaveDays, onClose }: Props) {
  const remaining = leaveDays - r.leaveUsed;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__title">계획을 저장했어요</div>
        <div className="modal__date">{r.start} – {r.end}</div>
        <div className="modal__info">연차 사용 {r.leaveUsed}일 · 사용 후 잔여 {remaining}일</div>
        <button className="google-cal-btn modal__google-btn">Google 캘린더에 추가 ↗</button>
        <button className="text-btn modal__close-btn" onClick={onClose}>계속 확인하기</button>
        <div className="modal__notice">회사 연차 신청은 별도로 진행해주세요.</div>
      </div>
    </div>
  );
}
