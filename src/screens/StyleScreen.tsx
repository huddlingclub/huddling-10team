import { useState } from "react";
import planeIcon from "../assets/icons/plane.svg";
import sunIcon from "../assets/icons/sun.svg";
import { BackButton } from "../components/TopBar";
import StyleOption from "../components/StyleOption";
import type { VacationStyle } from "../types/recommendation";
import { Button } from "../ui";

export default function StyleScreen({ value, onBack, onNext }:
  { value: VacationStyle; onBack: () => void; onNext: (v: VacationStyle) => void }) {
  const [v, setV] = useState(value);
  return (
    <div className="screen screen--p24">
      <div className="nav1"><BackButton onClick={onBack} /></div>
      <h2 className="q-title">어떤 휴가를<br />좋아하세요?</h2>
      <p className="q-desc">고른 스타일로 추천 방식이 달라져요</p>
      <div className="style-opts">
        <StyleOption icon={planeIcon} title="길게 한 번 몰아서" desc="연차를 모아 4일 이상 긴 여행을 가고 싶어요"
          bars={1} on={v === "bulk"} onClick={() => setV("bulk")} />
        <StyleOption icon={sunIcon} title="짧게 자주" desc="연차 1~2개로 3~4일씩 자주 쉬고 싶어요"
          bars={6} on={v === "short"} onClick={() => setV("short")} />
      </div>
      <div className="screen__cta"><Button onClick={() => onNext(v)}>다음</Button></div>
    </div>
  );
}
