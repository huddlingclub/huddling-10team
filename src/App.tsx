import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import InputForm from "./components/InputForm";
import ResultPanel from "./components/ResultPanel";
import { addDays, diffDays } from "./lib/date";
import type { Recommendation, SearchCondition } from "./types/recommendation";

// TODO: api/holidays + lib/recommend 연결 전까지 쓰는 임시 결과.
// 날짜는 고정값이 아니라 입력한 기간 안에서 계산해 만든다 (실제 추천이 아님).
function makeSample(c: SearchCondition): Recommendation[] {
  const span = diffDays(c.start, c.end) + 1; // 기간 일수
  const make = (id: string, offset: number, length: number): Recommendation | null => {
    const len = Math.min(length, span - offset);
    if (len < 1) return null;
    const start = addDays(c.start, offset);
    return {
      id,
      start,
      end: addDays(start, len - 1),
      leaveUsed: Math.min(c.leaveDays, len),
      totalDays: len,
      holidayNames: ["예시 연휴"],
    };
  };
  const len1 = c.leaveDays + 4;
  return [make("1", 0, len1), make("2", len1 + 7, Math.max(3, Math.floor(len1 / 2)))].filter(
    (r): r is Recommendation => r !== null,
  );
}

export default function App() {
  const [results, setResults] = useState<Recommendation[] | null>(null);

  return (
    <div className="page">
      <Header />
      <Hero />
      <InputForm onSubmit={(c) => setResults(makeSample(c))} />
      <ResultPanel results={results} />
      <footer className="footer">
        공휴일 데이터: 공공데이터포털 특일 정보 API (예정) · 와이어프레임이므로 결과는 예시 데이터입니다.
      </footer>
    </div>
  );
}
