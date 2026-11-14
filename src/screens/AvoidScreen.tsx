import { useState } from "react";
import Illustration from "../components/Illustration";
import { StepBar } from "../components/TopBar";
import { monthLabel, monthRange } from "../lib/date";
import { Button, Chip } from "../ui";

export default function AvoidScreen({ startMonth, endMonth, value, onBack, onNext }:
  { startMonth: string; endMonth: string; value: string[]; onBack: () => void; onNext: (m: string[]) => void }) {
  const [sel, setSel] = useState(value);
  const months = monthRange(startMonth, endMonth);
  const years = [...new Set(months.map((m) => m.slice(0, 4)))];
  const toggle = (m: string) => setSel((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  return (
    <div className="screen">
      <StepBar step={2} total={2} onBack={onBack} />
      <div className="screen__body">
        <div className="intro intro--q">
          <Illustration size={80} />
          <div className="bubble">
            <h2 className="q">피하고 싶은<br />달이 있나요?</h2>
            <p>마감·성수기처럼 쉬기 어려운 달</p>
          </div>
        </div>
        {years.map((y, i) => (
          <section key={y} className="months">
            <div className="months__head">
              <span>{y}년</span>
              {i === 0 && <span>{sel.length}개 골랐어요</span>}
            </div>
            <div className="months__grid">
              {months.filter((m) => m.startsWith(y)).map((m) => (
                <Chip key={m} on={sel.includes(m)} onClick={() => toggle(m)}>{monthLabel(m)}</Chip>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="screen__cta">
        <p className="skip">없으면 넘어가도 돼요</p>
        <Button onClick={() => onNext(sel)}>결과 보기</Button>
      </div>
    </div>
  );
}
