import type { Recommendation } from "../types/recommendation";
import { Badge, Card, Tag } from "../ui";

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
        <>
        <p className="sample-note">와이어프레임 예시 결과예요. 실제 추천이 아닙니다.</p>
        <ul className="cards">
          {results.map((r, i) => (
            <li key={r.id}>
              <Card focus={i === 0}>
                <div className="card__head">
                  <div>
                    <h3>{r.holidayNames[0]} 연휴</h3>
                    <p className="card__sub">{r.start} ~ {r.end}</p>
                  </div>
                  <Badge>효율 {(r.totalDays / r.leaveUsed).toFixed(1)}배</Badge>
                </div>
                <div className="card__flow">
                  <span>연차 {r.leaveUsed}개</span><i>→</i><b>{r.totalDays}일 휴가</b>
                </div>
                <div className="card__flow">
                  {r.holidayNames.map((n) => <Tag key={n}>{n}</Tag>)}
                </div>
              </Card>
            </li>
          ))}
        </ul>
        </>
      )}
    </section>
  );
}
