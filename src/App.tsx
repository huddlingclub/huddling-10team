import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import InputForm from "./components/InputForm";
import ResultScreen from "./components/ResultScreen";
import ConfirmScreen from "./components/ConfirmScreen";
import SavedModal from "./components/SavedModal";
import type { Recommendation, SearchCondition } from "./types/recommendation";

type Screen = "home" | "result" | "confirm" | "saved";

// TODO: api/holidays + lib/recommend 연결. 지금은 와이어프레임용 예시 데이터.
const SAMPLE: Recommendation[] = [
  {
    id: "1",
    start: "2027.9.11(토)",
    end: "2027.9.19(일)",
    leaveUsed: 2,
    totalDays: 9,
    holidayNames: ["추석"],
    label: "추석",
    leaveDates: ["2027-09-13", "2027-09-17"],
    holidayDates: ["2027-09-14", "2027-09-15", "2027-09-16"],
  },
  {
    id: "2",
    start: "2027.5.1(토)",
    end: "2027.5.5(수)",
    leaveUsed: 2,
    totalDays: 5,
    holidayNames: ["어린이날"],
    label: "어린이날",
    leaveDates: ["2027-05-03", "2027-05-04"],
    holidayDates: ["2027-05-05"],
  },
  {
    id: "3",
    start: "2027.5.13(목)",
    end: "2027.5.16(일)",
    leaveUsed: 1,
    totalDays: 4,
    holidayNames: ["부처님오신날"],
    label: "부처님오신날",
    leaveDates: ["2027-05-13"],
    holidayDates: ["2027-05-15"],
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [condition, setCondition] = useState<SearchCondition | null>(null);
  const [selected, setSelected] = useState<Recommendation | null>(null);

  const handleSubmit = (c: SearchCondition) => {
    setCondition(c);
    setScreen("result");
  };

  const handleSelect = (r: Recommendation) => {
    setSelected(r);
    setScreen("confirm");
  };

  const handleSave = () => {
    setScreen("saved");
  };

  if (screen === "result" && condition) {
    return (
      <ResultScreen
        leaveDays={condition.leaveDays}
        results={SAMPLE}
        onSelect={handleSelect}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "confirm" && selected && condition) {
    return (
      <ConfirmScreen
        recommendation={selected}
        leaveDays={condition.leaveDays}
        onSave={handleSave}
        onBack={() => setScreen("result")}
      />
    );
  }

  return (
    <div className="page">
      <Header />
      <Hero />
      <InputForm onSubmit={handleSubmit} />
      {screen === "saved" && selected && condition && (
        <SavedModal
          recommendation={selected}
          leaveDays={condition.leaveDays}
          onClose={() => setScreen("home")}
        />
      )}
      <footer className="footer">
        공휴일 데이터: 공공데이터포털 특일 정보 API (예정) · 와이어프레임이므로 결과는 예시 데이터입니다.
      </footer>
    </div>
  );
}
