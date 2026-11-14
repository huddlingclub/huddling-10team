import { useEffect, useState } from "react";
import checkBlue from "../assets/icons/check-blue.svg";
import dots from "../assets/icons/dots.svg";
import cast from "../assets/illustrations/penguin-cast.png";

const STEPS = ["공휴일과 주말 맞춰보기", "징검다리 연휴 찾는 중", "연차 효율 계산하기"];

export default function LoadingScreen({ tip, onDone }: { tip: string; onDone: () => void }) {
  const [stage, setStage] = useState(1); // 0..2: 진행 중인 단계 (그 앞은 완료)
  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 700);
    const t2 = setTimeout(onDone, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="screen screen--load">
      <div className="load__img"><img src={cast} alt="" /></div>
      <h2 className="load__title" role="status">황금연휴를 찾고 있어요</h2>
      <p className="load__desc">징검다리 연휴를 찾는 중이에요</p>
      <img className="load__dots" src={dots} width={33} height={7} alt="" />
      <ol className="load__steps">
        {STEPS.map((label, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "todo";
          return (
            <li key={label} className={`step-row step-row--${state}`}>
              <span className="step-row__badge">
                {state === "done" ? <img src={checkBlue} width={14} height={14} alt="완료" /> : i + 1}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>
      <p className="load__tip">{tip}</p>
    </div>
  );
}
