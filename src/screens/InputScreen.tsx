import { useState } from "react";
import Illustration from "../components/Illustration";
import { monthEnd, monthsFromNow, today, ym } from "../lib/date";
import { validate } from "../lib/validate";
import { Button, Sparkle, Stepper } from "../ui";

export interface InputValue { leaveDays: number; startMonth: string; endMonth: string }

const OPTIONS = monthsFromNow(25);
const label = (s: string) => `${s.slice(0, 4)}년 ${Number(s.slice(5))}월`;

/** 시작일: 이번 달이면 오늘, 아니면 1일. 종료일: 선택한 달의 말일 */
export const toRange = (v: InputValue) => ({
  start: v.startMonth === ym(today()) ? today() : `${v.startMonth}-01`,
  end: v.endMonth ? monthEnd(v.endMonth) : "",
});

export default function InputScreen({ value, onNext }: { value: InputValue; onNext: (v: InputValue) => void }) {
  const [v, setV] = useState(value);
  const [error, setError] = useState<string>();

  const check = (next: InputValue) => {
    const errs = validate({ ...toRange(next), leaveDays: next.leaveDays, style: "bulk", avoidMonths: [] });
    return errs.start ?? errs.end ?? errs.leaveDays;
  };
  const update = (patch: Partial<InputValue>) => {
    const next = { ...v, ...patch };
    setV(next);
    if (error) setError(check(next));
  };

  return (
    <div className="screen">
      <div className="screen__body">
        <div className="intro">
          <div>
            <span className="ui-hint-plain"><Sparkle /> 황금연휴 플래너</span>
            <h1 className="title">연차, 언제 써야<br /><em>가장 길게</em> 쉴까요?</h1>
            <p className="lead">기간과 남은 연차만 알려주세요.<br />공휴일을 엮어 황금연휴를 찾아드릴게요.</p>
          </div>
          <Illustration size={104} />
        </div>

        <div className="field">
          <span className="label">휴가 계획 기간</span>
          <div className="row">
            {(["startMonth", "endMonth"] as const).map((k, i) => (
              <div key={k} className="select-wrap">
                <select className="ui-field" aria-label={i ? "종료 월" : "시작 월"} aria-invalid={!!error}
                  value={v[k]} onChange={(e) => update({ [k]: e.target.value })}>
                  <option value="">{i ? "종료 월 선택" : "시작 월 선택"}</option>
                  {OPTIONS.map((m) => <option key={m} value={m}>{label(m)}</option>)}
                </select>
                {i === 0 && <span className="tilde">~</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">사용할 수 있는 연차</span>
          <Stepper value={v.leaveDays} min={0} max={30} onChange={(leaveDays) => update({ leaveDays })} />
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <span className="ui-hint"><Sparkle /> 공휴일·대체공휴일까지 알아서 계산해요</span>
      </div>

      <div className="screen__cta">
        <Button onClick={() => { const e = check(v); setError(e); if (!e) onNext(v); }}>황금연휴 찾기</Button>
      </div>
    </div>
  );
}
