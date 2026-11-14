import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import InputForm from "./components/InputForm";
import ResultPanel from "./components/ResultPanel";
import type { Recommendation, SearchCondition } from "./types/recommendation";

// TODO: api/holidays + lib/recommend 연결. 지금은 와이어프레임용 예시 데이터.
const SAMPLE: Recommendation[] = [
  { id: "1", start: "2025-09-29", end: "2025-10-09", leaveUsed: 3, totalDays: 11, holidayNames: ["추석", "개천절", "한글날"] },
  { id: "2", start: "2025-01-25", end: "2025-02-02", leaveUsed: 3, totalDays: 9, holidayNames: ["설날"] },
];

export default function App() {
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const handleSubmit = (_c: SearchCondition) => setResults(SAMPLE);

  return (
    <div className="page">
      <Header />
      <Hero />
      <InputForm onSubmit={handleSubmit} />
      <ResultPanel results={results} />
      <footer className="footer">
        공휴일 데이터: 공공데이터포털 특일 정보 API (예정) · 와이어프레임이므로 결과는 예시 데이터입니다.
      </footer>
    </div>
  );
}
