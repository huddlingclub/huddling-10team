import { useState } from "react";
import type { Recommendation } from "../types/recommendation";
import MiniCalendar from "./MiniCalendar";

interface Props {
  leaveDays: number;
  results: Recommendation[];
  onSelect: (r: Recommendation) => void;
  onBack: () => void;
}

export default function ResultScreen({ leaveDays, results, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<Recommendation>(results[0]);
  const best = results[0];
  const others = results.slice(1);

  return (
    <div className="screen">
      {/* 헤더 */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span>나의 황금연휴</span>
        <span />
      </div>

      {/* 남은 연차 */}
      <div className="leave-summary-card">
        <div>
          <div className="leave-summary__label">남은 연차</div>
          <div className="leave-summary__days">{leaveDays}일</div>
          <div className="leave-summary__period">계산 기간 2026.11.14 – 2027.12.31</div>
        </div>
        <button className="outline-btn">조건 변경</button>
      </div>

      {/* 베스트 추천 카드 */}
      <div className="best-card">
        <div className="best-card__tag">가장 길게 쉬는 추천</div>
        <div className="best-card__title">연차 {best.leaveUsed}일로, {best.totalDays}일 쉬어요</div>
        <div className="best-card__date">
          {best.start} – {best.end} · {best.holidayNames.join(", ")}
        </div>
        <div className="best-card__leave-dates">
          <span className="best-card__leave-label">쓸 연차</span>
          <span className="best-card__leave-value">
            {best.leaveDates.map((d) => {
              const date = new Date(d);
              const days = ["일", "월", "화", "수", "목", "금", "토"];
              return `${date.getMonth() + 1}.${date.getDate()}(${days[date.getDay()]})`;
            }).join(" · ")}
          </span>
        </div>
        <div className="best-card__remaining">사용 후에도 연차 {leaveDays - best.leaveUsed}일이 남아요</div>
      </div>

      {/* 미니 캘린더 */}
      <MiniCalendar recommendation={best} />

      {/* 이 일정 선택 버튼 */}
      <button className="primary-btn" onClick={() => onSelect(selected)}>이 일정 선택</button>

      {/* 다른 추천 일정 */}
      {others.length > 0 && (
        <div className="other-section">
          <div className="other-section__title">다른 추천 일정</div>
          <div className="other-section__desc">공휴일과 주말을 이어 쉬어보세요</div>
          {others.map((r) => (
            <button
              key={r.id}
              className={`other-card ${selected.id === r.id ? "is-selected" : ""}`}
              onClick={() => setSelected(r)}
            >
              <div>
                <div className="other-card__name">{r.holidayNames[0]} 연휴</div>
                <div className="other-card__date">{r.start} – {r.end}</div>
              </div>
              <div className="other-card__info">
                <div className="other-card__total">{r.totalDays}일 휴식</div>
                <div className="other-card__leave">연차 {r.leaveUsed}일 사용</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="screen-footer">
        주 5일 근무 · 대한민국 공휴일 기준<br />
        회사 휴무와 연차 만료일에 따라 달라질 수 있어요.
      </div>
    </div>
  );
}
