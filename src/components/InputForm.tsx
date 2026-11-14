import { useState } from "react";
import type { SearchCondition } from "../types/recommendation";
import { endOfThisYear, today } from "../lib/date";
import { validate, type FormErrors } from "../lib/validate";
import { Button, Field, Stepper } from "../ui";
import StyleToggle from "./StyleToggle";

interface Props {
  onSubmit: (c: SearchCondition) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [c, setC] = useState<SearchCondition>(() => ({
    leaveDays: 5,
    start: today(),
    end: endOfThisYear(),
    style: "wonkiok",
  }));
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (patch: Partial<SearchCondition>) => {
    const next = { ...c, ...patch };
    setC(next);
    if (Object.keys(errors).length) setErrors(validate(next)); // 오류가 보이는 동안만 실시간 갱신
  };

  return (
    <form
      className="panel"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validate(c);
        setErrors(errs);
        if (Object.keys(errs).length === 0) onSubmit(c);
      }}
    >
      <span className="step">① 조건 입력</span>

      <div className="field">
        <span className="label">사용할 연차 개수</span>
        <Stepper value={c.leaveDays} unit="일" min={0} onChange={(leaveDays) => update({ leaveDays })} />
        {errors.leaveDays && <p className="error" role="alert">{errors.leaveDays}</p>}
      </div>

      <div className="field">
        <span className="label">계산할 기간 범위</span>
        <div className="row">
          <Field type="date" aria-label="시작일" aria-invalid={!!errors.start} value={c.start}
            onChange={(e) => update({ start: e.target.value })} />
          <span>~</span>
          <Field type="date" aria-label="종료일" aria-invalid={!!errors.end} value={c.end}
            onChange={(e) => update({ end: e.target.value })} />
        </div>
        {(errors.start || errors.end) && <p className="error" role="alert">{errors.start ?? errors.end}</p>}
      </div>

      <StyleToggle value={c.style} onChange={(style) => update({ style })} />

      <Button type="submit">계산하기</Button>
    </form>
  );
}
