import { useState } from "react";
import type { SearchCondition } from "../types/recommendation";
import { Button, Field, Stepper } from "../ui";
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
    <form className="panel" onSubmit={(e) => { e.preventDefault(); onSubmit(c); }}>
      <span className="step">① 조건 입력</span>

      <div className="field">
        <span className="label">사용할 연차 개수</span>
        <Stepper value={c.leaveDays} unit="일" onChange={(leaveDays) => setC({ ...c, leaveDays })} />
      </div>

      <div className="field">
        <span className="label">계산할 기간 범위</span>
        <div className="row">
          <Field type="date" value={c.start} onChange={(e) => setC({ ...c, start: e.target.value })} />
          <span>~</span>
          <Field type="date" value={c.end} onChange={(e) => setC({ ...c, end: e.target.value })} />
        </div>
      </div>

      <StyleToggle value={c.style} onChange={(style) => setC({ ...c, style })} />

      <Button type="submit">계산하기</Button>
    </form>
  );
}
