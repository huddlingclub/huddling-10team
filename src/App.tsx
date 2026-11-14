import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfThisYear, today, ym } from "./lib/date";
import { countHolidaysInYear, sampleRecommend } from "./lib/sampleRecommend";
import ConfirmScreen from "./screens/ConfirmScreen";
import EmptyScreen from "./screens/EmptyScreen";
import InputScreen, { toRange, type InputValue } from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ResultScreen from "./screens/ResultScreen";
import StyleScreen from "./screens/StyleScreen";
import type { Recommendation, SearchCondition, VacationStyle } from "./types/recommendation";

type Screen = "input" | "style" | "loading" | "result" | "confirm";

export default function App() {
  const [screen, setScreen] = useState<Screen>("input");
  const [input, setInput] = useState<InputValue>({
    leaveDays: 15,
    startMonth: ym(today()), // 시작일 기본값: 오늘
    endMonth: ym(endOfThisYear()), // 종료일 기본값: 올해 12월 31일
  });
  const [style, setStyle] = useState<VacationStyle>("bulk");

  const cond: SearchCondition = useMemo(
    () => ({ leaveDays: input.leaveDays, ...toRange(input), style }),
    [input, style],
  );
  // TODO: lib/sampleRecommend → 실제 공휴일 API + 추천 알고리즘으로 교체
  const results = useMemo(() => sampleRecommend(cond), [cond]);
  const done = useCallback(() => setScreen("result"), []);
  const [plan, setPlan] = useState<{ rec: Recommendation; available: number }>();
  useEffect(() => { window.scrollTo(0, 0); }, [screen]); // 화면 전환 시 맨 위로 (반환값 없음)

  const tipYear = Number(cond.end.slice(0, 4));
  const tip = `${tipYear}년엔 공휴일이 ${countHolidaysInYear(cond, tipYear)}번 있어요`;

  return (
    <div className="app">
      {screen === "input" && (
        <InputScreen value={input} onNext={(v) => { setInput(v); setScreen("style"); }} />
      )}
      {screen === "style" && (
        <StyleScreen value={style} onBack={() => setScreen("input")} onNext={(s) => { setStyle(s); setScreen("loading"); }} />
      )}
      {screen === "loading" && <LoadingScreen tip={tip} onDone={done} />}
      {(screen === "result" || screen === "confirm") &&
        (results.length ? (
          // 계획 확인에서 돌아와도 담은 연휴가 유지되도록 숨기기만 한다
          <div hidden={screen === "confirm"}>
            <ResultScreen key={JSON.stringify(cond)} cond={cond} results={results}
              onBack={() => setScreen("style")} onEditRange={() => setScreen("input")}
              onConfirm={(rec, available) => { setPlan({ rec, available }); setScreen("confirm"); }} />
          </div>
        ) : (
          <EmptyScreen cond={cond} onBack={() => setScreen("style")}
            onEditRange={() => setScreen("input")} />
        ))}
      {screen === "confirm" && plan && (
        <ConfirmScreen rec={plan.rec} available={plan.available} onBack={() => setScreen("result")} />
      )}
    </div>
  );
}
