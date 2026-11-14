import { useState } from "react";
import { StepBar } from "../components/TopBar";
import type { VacationStyle } from "../types/recommendation";
import { Button, Plane, SelectCard, Sun } from "../ui";

const Cal = () => (
  <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" />
  </svg>
);

const OPTIONS: { v: VacationStyle; icon: React.ReactNode; title: string; desc: string; dots: number }[] = [
  { v: "bulk", icon: <Plane />, title: "길게 한 번 몰아서", desc: "연차를 모아 7일 이상 긴 여행을 가고 싶어요", dots: 1 },
  { v: "balanced", icon: <Cal />, title: "적당히 여러 번", desc: "4~6일짜리 연휴를 1년에 골고루 나누고 싶어요", dots: 3 },
  { v: "short", icon: <Sun />, title: "짧게 자주", desc: "연차 1~2개로 3~4일씩 자주 쉬고 싶어요", dots: 6 },
];

export default function StyleScreen({ value, onBack, onNext }:
  { value: VacationStyle; onBack: () => void; onNext: (v: VacationStyle) => void }) {
  const [v, setV] = useState(value);
  return (
    <div className="screen">
      <StepBar step={1} total={2} onBack={onBack} />
      <div className="screen__body">
        <h2 className="q">어떤 휴가를 좋아하세요?</h2>
        <div className="stack">
          {OPTIONS.map((o) => (
            <div key={o.v} className="opt">
              <SelectCard icon={o.icon} title={o.title} desc={o.desc} on={v === o.v} onClick={() => setV(o.v)} />
              <div className={`opt__dots ${v === o.v ? "on" : ""}`} aria-hidden>
                {Array.from({ length: o.dots }, (_, i) => <i key={i} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="screen__cta"><Button onClick={() => onNext(v)}>다음</Button></div>
    </div>
  );
}
