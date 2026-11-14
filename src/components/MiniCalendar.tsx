import type { Recommendation } from "../types/recommendation";

interface Props {
  recommendation: Recommendation;
}

export default function MiniCalendar({ recommendation }: Props) {
  const startDate = new Date(recommendation.start);
  const endDate = new Date(recommendation.end);
  const year = startDate.getFullYear();
  const month = startDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  const leaveDateSet = new Set(recommendation.leaveDates);
  const holidayDateSet = new Set(recommendation.holidayDates);

  const isInRange = (day: number) => {
    const d = new Date(year, month, day);
    return d >= startDate && d <= endDate;
  };

  const getType = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (leaveDateSet.has(key)) return "leave";
    if (holidayDateSet.has(key)) return "holiday";
    if (isInRange(day)) return "range";
    return "none";
  };

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) { weeks.push([...week, ...Array(7 - week.length).fill(null)]); }

  const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <span className="mini-cal__title">{year}년 {month + 1}월</span>
        <div className="mini-cal__nav">
          <button>‹</button>
          <button>›</button>
        </div>
      </div>
      <div className="mini-cal__grid">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`mini-cal__day-label ${i === 0 ? "is-sun" : i === 6 ? "is-sat" : ""}`}>{d}</div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={`${wi}-${di}`} />;
            const type = getType(day);
            const isSun = di === 0;
            const isSat = di === 6;
            return (
              <div
                key={`${wi}-${di}`}
                className={[
                  "mini-cal__cell",
                  type === "leave" ? "is-leave" : "",
                  type === "holiday" ? "is-holiday" : "",
                  type === "range" ? "is-range" : "",
                  isSun ? "is-sun" : "",
                  isSat ? "is-sat" : "",
                ].filter(Boolean).join(" ")}
              >
                {day}
              </div>
            );
          })
        )}
      </div>
      <div className="mini-cal__legend">
        <span className="legend-item"><span className="legend-dot is-leave" />쓸 연차</span>
        <span className="legend-item"><span className="legend-dot is-range" />쉬는 기간</span>
        <span className="legend-item"><span className="legend-dot is-holiday" />{recommendation.holidayNames[0]}</span>
      </div>
    </div>
  );
}
