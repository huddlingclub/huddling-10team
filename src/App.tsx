import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfThisYear, today, ym } from "./lib/date";
import { countHolidaysInYear, sampleRecommend } from "./lib/sampleRecommend";
import ConfirmScreen from "./screens/ConfirmScreen";
import EmptyScreen from "./screens/EmptyScreen";
import InputScreen, { toRange, type InputValue } from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ResultScreen from "./screens/ResultScreen";
import ShortConfirmScreen from "./screens/ShortConfirmScreen";
import ShortResultScreen from "./screens/ShortResultScreen";
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
  // 확인 화면에 넘길 계획: 몰아서는 연휴 1개, 짧게 자주는 고른 연휴 여러 개
  const [plan, setPlan] = useState<{ recs: Recommendation[]; available: number }>();
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
            {style === "short" ? (
              <ShortResultScreen key={JSON.stringify(cond)} cond={cond} results={results}
                onBack={() => setScreen("style")} onEditRange={() => setScreen("input")}
                onConfirm={(recs, available) => { setPlan({ recs, available }); setScreen("confirm"); }} />
            ) : (
              <ResultScreen key={JSON.stringify(cond)} cond={cond} results={results}
                onBack={() => setScreen("style")} onEditRange={() => setScreen("input")}
                onConfirm={(rec, available) => { setPlan({ recs: [rec], available }); setScreen("confirm"); }} />
            )}
          </div>
        ) : (
          <EmptyScreen cond={cond} onBack={() => setScreen("style")}
            onEditRange={() => setScreen("input")} />
        ))}
      {screen === "confirm" && plan && (style === "short" ? (
        <ShortConfirmScreen recs={plan.recs} available={plan.available} onBack={() => setScreen("result")} />
      ) : (
        <ConfirmScreen rec={plan.recs[0]} available={plan.available} onBack={() => setScreen("result")} />
      ))}
    </div>
  );
}
