import { useCallback, useMemo, useState } from "react";
import ConfirmScreen from "./components/ConfirmScreen";
import SavedModal from "./components/SavedModal";
import { endOfThisYear, today, ym } from "./lib/date";
import { sampleRecommend } from "./lib/sampleRecommend";
import AvoidScreen from "./screens/AvoidScreen";
import EmptyScreen from "./screens/EmptyScreen";
import InputScreen, { toRange, type InputValue } from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ResultScreen from "./screens/ResultScreen";
import StyleScreen from "./screens/StyleScreen";
import type { Recommendation, SearchCondition, VacationStyle } from "./types/recommendation";

type Screen = "input" | "style" | "avoid" | "loading" | "result" | "confirm" | "saved";

export default function App() {
  const [screen, setScreen] = useState<Screen>("input");
  const [input, setInput] = useState<InputValue>({
    leaveDays: 15,
    startMonth: ym(today()),
    endMonth: ym(endOfThisYear()),
  });
  const [style, setStyle] = useState<VacationStyle>("bulk");
  const [avoid, setAvoid] = useState<string[]>([]);
  const [selected, setSelected] = useState<Recommendation | null>(null);

  const cond: SearchCondition = useMemo(
    () => ({ leaveDays: input.leaveDays, ...toRange(input), style, avoidMonths: avoid }),
    [input, style, avoid],
  );
  // TODO: lib/sampleRecommend → 실제 공휴일 API + 추천 알고리즘으로 교체
  const results = useMemo(() => sampleRecommend(cond), [cond]);
  const done = useCallback(() => setScreen("result"), []);

  const handleSelect = (r: Recommendation) => {
    setSelected(r);
    setScreen("confirm");
  };

  return (
    <div className="app">
      {screen === "input" && (
        <InputScreen value={input} onNext={(v) => { setInput(v); setScreen("style"); }} />
      )}
      {screen === "style" && (
        <StyleScreen value={style} onBack={() => setScreen("input")} onNext={(s) => { setStyle(s); setScreen("avoid"); }} />
      )}
      {screen === "avoid" && (
        <AvoidScreen startMonth={input.startMonth} endMonth={input.endMonth} value={avoid}
          onBack={() => setScreen("style")} onNext={(a) => { setAvoid(a); setScreen("loading"); }} />
      )}
      {screen === "loading" && <LoadingScreen onDone={done} />}
      {screen === "result" &&
        (results.length ? (
          <ResultScreen key={JSON.stringify(cond)} cond={cond} results={results}
            onBack={() => setScreen("avoid")} onEditRange={() => setScreen("input")}
            onSelect={handleSelect} />
        ) : (
          <EmptyScreen cond={cond} onBack={() => setScreen("avoid")}
            onEditRange={() => setScreen("input")} onEditAvoid={() => setScreen("avoid")} />
        ))}
      {screen === "confirm" && selected && (
        <ConfirmScreen
          recommendation={selected}
          leaveDays={cond.leaveDays}
          onSave={() => setScreen("saved")}
          onBack={() => setScreen("result")}
        />
      )}
      {screen === "saved" && selected && (
        <SavedModal
          recommendation={selected}
          leaveDays={cond.leaveDays}
          onClose={() => setScreen("input")}
        />
      )}
    </div>
  );
}
