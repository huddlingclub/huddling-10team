import tilt from "../assets/illustrations/penguin-tilt.png";
import { TopBar } from "../components/TopBar";
import { dotDate, monthRange } from "../lib/date";
import type { SearchCondition } from "../types/recommendation";
import { Button, ProgressBar } from "../ui";

export default function EmptyScreen({ cond, onBack, onEditRange }:
  { cond: SearchCondition; onBack: () => void; onEditRange: () => void }) {
  const months = monthRange(cond.start.slice(0, 7), cond.end.slice(0, 7)).length;
  return (
    <div className="screen screen--grey screen--p16 screen--nav52">
      <TopBar title="나의 황금연휴 계획" onBack={onBack} />
      <section className="plan-card">
        <p className="plan-card__range">{dotDate(cond.start)} ~ {dotDate(cond.end)}</p>
        <div className="plan-card__stats">
          <div>
            <p className="plan-card__label">남은 연차</p>
            <p className="plan-card__big">{cond.leaveDays}<small> / {cond.leaveDays}개</small></p>
          </div>
          <div className="plan-card__right">
            <p className="plan-card__label">연차로 만든 휴가</p>
            <p className="plan-card__zero">0일</p>
          </div>
        </div>
        <ProgressBar value={0} thick />
      </section>

      <section className="empty-card">
        <img src={tilt} width={164} height={150} alt="" />
        <h2>조건에 맞는 황금연휴가 없어요</h2>
        <p>기간을 넓히거나 연차를 늘려보세요.</p>
        <div className="tags">
          <span className="tag tag--on">기간 {months}개월</span>
          <span className="tag">연차 {cond.leaveDays}개</span>
        </div>
      </section>

      <div className="screen__cta"><Button onClick={onEditRange}>기간 넓히기</Button></div>
    </div>
  );
}
