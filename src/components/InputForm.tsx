import { useState } from "react";
import type { SearchCondition } from "../types/recommendation";
import StyleToggle from "./StyleToggle";

interface Props {
  onSubmit: (c: SearchCondition) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [c, setC] = useState<SearchCondition>({
    leaveDays: 5,
    start: "2025-01-01",
    end: "2025-12-31",
    style: "wonkiok",
  });

  return (
    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(c);
      }}
    >
      <span className="step">① 조건 입력</span>

      <div className="field">
        <label className="label" htmlFor="days">사용할 연차 개수</label>
        <div className="row">
          <input
            id="days"
            type="number"
            min={1}
            value={c.leaveDays}
            onChange={(e) => setC({ ...c, leaveDays: Number(e.target.value) })}
          />
          <span>일</span>
        </div>
      </div>

      <div className="field">
        <span className="label">계산할 기간 범위</span>
        <div className="row">
          <input type="date" value={c.start} onChange={(e) => setC({ ...c, start: e.target.value })} />
          <span>~</span>
          <input type="date" value={c.end} onChange={(e) => setC({ ...c, end: e.target.value })} />
        </div>
      </div>

      <StyleToggle value={c.style} onChange={(style) => setC({ ...c, style })} />

      <button type="submit" className="btn">계산하기</button>
    </form>
  );
}
