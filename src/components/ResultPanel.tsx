import type { Recommendation } from "../types/recommendation";

interface Props {
  results: Recommendation[] | null;
}

export default function ResultPanel({ results }: Props) {
  return (
    <section className="panel">
      <span className="step">② 추천 결과</span>
      {results === null ? (
        <div className="empty">
          <div className="illust-ph">일러스트</div>
          <p>조건을 입력하고 계산하기를 누르면 결과가 여기에 나타나요.</p>
        </div>
      ) : (
        <ul className="cards">
          {results.map((r) => (
            <li key={r.id} className="card">
              <strong>{r.start} ~ {r.end}</strong>
              <span>연차 {r.leaveUsed}일 → 총 {r.totalDays}일 휴식</span>
              <small>{r.holidayNames.join(", ")}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
