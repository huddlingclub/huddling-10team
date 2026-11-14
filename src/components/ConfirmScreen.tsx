import type { Recommendation } from "../types/recommendation";

interface Props {
  recommendation: Recommendation;
  leaveDays: number;
  onSave: () => void;
  onBack: () => void;
}

export default function ConfirmScreen({ recommendation: r, leaveDays, onSave, onBack }: Props) {
  const remaining = leaveDays - r.leaveUsed;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
  };

  // 타임라인 세그먼트 생성
  const segments = buildSegments(r);

  return (
    <div className="screen">
      {/* 헤더 */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <span>휴가 계획 확인</span>
        <span />
      </div>

      {/* 선택 요약 카드 */}
      <div className="confirm-summary-card">
        <div className="confirm-summary__tag">선택한 휴가 계획 · {r.label || r.holidayNames[0]}</div>
        <div className="confirm-summary__title">{r.leaveUsed}일 쓰고, {r.totalDays}일 쉬어요</div>
        <div className="confirm-summary__date">{r.start} – {r.end}</div>
      </div>

      {/* 신청할 연차 */}
      <div className="confirm-section">
        <div className="confirm-section__header">
          <span className="confirm-section__title">신청할 연차</span>
          <span className="confirm-section__total blue">총 {r.leaveUsed}일</span>
        </div>
        {r.leaveDates.map((d) => (
          <div key={d} className="confirm-leave-row">
            <span>{formatDate(d)}</span>
            <span className="blue">1일</span>
          </div>
        ))}
        <div className="confirm-leave-balance">
          <span>남은 {leaveDays}일 – 사용할 {r.leaveUsed}일</span>
          <span className="blue">잔여 {remaining}일</span>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="confirm-section">
        <div className="confirm-section__title">이렇게 {r.totalDays}일을 쉬어요</div>
        <div className="timeline">
          {segments.map((seg, i) => (
            <div key={i} className={`timeline-seg ${seg.type}`}>
              <div className="timeline-seg__dates">{seg.label}</div>
              <div className="timeline-seg__type">{seg.typeName}</div>
            </div>
          ))}
        </div>
        <div className="timeline-desc">
          주말 {segments.filter(s => s.type === "weekend").reduce((a, s) => a + s.days, 0)}일 + 공휴일 {r.holidayDates.length}일 + 연차 {r.leaveUsed}일
        </div>
      </div>

      {/* Google 캘린더 추가 */}
      <div className="calendar-add-card">
        <div className="calendar-add-card__title">내 캘린더에도 추가하세요</div>
        <div className="calendar-add-card__desc">
          {r.totalDays}일의 휴식 기간을 종일 일정으로 추가해요.<br />
          연차 신청일은 일정 설명에 포함돼요.
        </div>
        <button className="google-cal-btn">Google 캘린더에 추가 ↗</button>
        <div className="calendar-add-card__note">Google 로그인 후 직접 저장할 수 있어요.</div>
      </div>

      <div className="confirm-notice">
        계획 저장은 회사 연차 신청과 달라요.<br />
        연차는 회사에 별도로 신청해주세요.
      </div>

      {/* 하단 버튼 */}
      <div className="confirm-actions">
        <button className="primary-btn" onClick={onSave}>내 휴가 계획 저장</button>
        <button className="text-btn" onClick={onBack}>다른 일정 고르기</button>
      </div>
    </div>
  );
}

interface Segment {
  label: string;
  type: "weekend" | "leave" | "holiday";
  typeName: string;
  days: number;
}

function buildSegments(r: Recommendation): Segment[] {
  const leaveSet = new Set(r.leaveDates);
  const holidaySet = new Set(r.holidayDates);
  const segments: Segment[] = [];

  const start = new Date(r.start);
  const end = new Date(r.end);

  let cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    const dow = cur.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const type = leaveSet.has(key) ? "leave" : holidaySet.has(key) ? "holiday" : "weekend";

    const last = segments[segments.length - 1];
    const dateLabel = `${cur.getMonth() + 1}-${cur.getDate()}`;

    if (last && last.type === type) {
      last.days++;
      last.label = last.label.split("–")[0] + `–${dateLabel}`;
    } else {
      segments.push({
        label: dateLabel,
        type,
        typeName: type === "leave" ? "연차" : type === "holiday" ? "추석" : "주말",
        days: 1,
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return segments;
}
