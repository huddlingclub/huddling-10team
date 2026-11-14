import Illustration from "../components/Illustration";
import { TopBar } from "../components/TopBar";
import { monthLabel, monthRange } from "../lib/date";
import type { SearchCondition } from "../types/recommendation";
import { Button, Card, ProgressBar, Tag } from "../ui";

export default function EmptyScreen({ cond, onBack, onEditRange, onEditAvoid }:
  { cond: SearchCondition; onBack: () => void; onEditRange: () => void; onEditAvoid: () => void }) {
  const dot = (s: string) => s.replace(/-/g, ".");
  const months = monthRange(cond.start.slice(0, 7), cond.end.slice(0, 7)).length;
  return (
    <div className="screen screen--grey">
      <TopBar title="나의 황금연휴 계획" onBack={onBack} />
      <div className="screen__body">
        <Card>
          <span className="sum__range">{dot(cond.start)} ~ {dot(cond.end)}</span>
          <div className="sum__row sum__row--end">
            <div><p className="sum__label">남은 연차</p><p className="num">{cond.leaveDays}<small> / {cond.leaveDays}개</small></p></div>
            <div className="sum__right"><p className="sum__label">연차로 만든 휴가</p><p className="num num--mute">0일</p></div>
          </div>
          <ProgressBar value={0} thick />
        </Card>
        <Card>
          <div className="empty">
            <Illustration size={150} />
            <h2 className="q">조건에 맞는 황금연휴가 없어요</h2>
            <p className="lead">기간을 넓혀보세요.<br />피하고 싶은 달을 줄여도 찾을 수 있어요.</p>
            <div className="tags">
              <span className="ui-badge">기간 {months}개월</span>
              <Tag>연차 {cond.leaveDays}개</Tag>
              {cond.avoidMonths.length > 0 && <Tag>피하는 달 {cond.avoidMonths.map(monthLabel).join(", ")}</Tag>}
            </div>
            <button type="button" className="ui-btn ui-btn--secondary" onClick={onEditAvoid}>피하는 달 다시 고르기</button>
          </div>
        </Card>
      </div>
      <div className="screen__cta"><Button onClick={onEditRange}>기간 넓히기</Button></div>
    </div>
  );
}
