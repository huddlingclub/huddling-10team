import { Fragment, useState } from "react";
import chevronDown from "../assets/icons/chevron-down.svg";
import sparkle from "../assets/icons/sparkle-12.svg";
import star from "../assets/icons/star.svg";
import LeaveStepper from "../components/LeaveStepper";
import { monthEnd, monthsFromNow, today, ym } from "../lib/date";
import { validate } from "../lib/validate";
import { Button } from "../ui";

export interface InputValue { leaveDays: number; startMonth: string; endMonth: string }

const label = (s: string) => `${s.slice(0, 4)}년 ${Number(s.slice(5))}월`;

/** 시작일: 이번 달이면 오늘, 아니면 1일. 종료일: 선택한 달의 말일 (월을 비우면 빈 문자열) */
export const toRange = (v: InputValue) => ({
  start: !v.startMonth ? "" : v.startMonth === ym(today()) ? today() : `${v.startMonth}-01`,
  end: v.endMonth ? monthEnd(v.endMonth) : "",
});

export default function InputScreen({ value, onNext }: { value: InputValue; onNext: (v: InputValue) => void }) {
  const [v, setV] = useState(value);
  const [error, setError] = useState<string>();
  const options = monthsFromNow(25); // 렌더마다 계산해 달이 바뀌어도 목록이 어긋나지 않게 한다

  const check = (next: InputValue) => {
    const errs = validate({ ...toRange(next), leaveDays: next.leaveDays, style: "bulk" });
    return errs.start ?? errs.end ?? errs.leaveDays;
  };
  const update = (patch: Partial<InputValue>) => {
    const next = { ...v, ...patch };
    setV(next);
    if (error) setError(check(next));
  };

  return (
    <div className="screen screen--p24 screen--in">
      <div className="in-eyebrow"><img src={star} width={14} height={14} alt="" />황금연휴 플래너</div>
      <h1 className="in-title">연차, 언제 써야<br /><em>가장 길게</em> 쉴까요?</h1>
      <p className="in-desc">기간과 남은 연차만 알려주세요.<br />공휴일을 엮어 황금연휴를 찾아드릴게요.</p>

      <span className="in-label in-label--first">휴가 계획 기간</span>
      <div className="in-period">
        {(["startMonth", "endMonth"] as const).map((k, i) => (
          <Fragment key={k}>
            {i === 1 && <span className="in-tilde">~</span>}
            <div className="in-select">
              <select aria-label={i ? "종료 월" : "시작 월"} aria-invalid={!!error} value={v[k]}
                onChange={(e) => update({ [k]: e.target.value })}>
                <option value="">{i ? "종료 월 선택" : "시작 월 선택"}</option>
                {options.map((m) => <option key={m} value={m}>{label(m)}</option>)}
              </select>
              <img src={chevronDown} width={20} height={20} alt="" />
            </div>
          </Fragment>
        ))}
      </div>

      <span className="in-label in-label--second">남은 연차</span>
      <LeaveStepper value={v.leaveDays} onChange={(leaveDays) => update({ leaveDays })} />

      {error && <p className="error in-error" role="alert">{error}</p>}
      <span className="in-pill"><img src={sparkle} width={12} height={12} alt="" />공휴일·대체공휴일까지 알아서 계산해요</span>

      <div className="screen__cta">
        <Button onClick={() => { const e = check(v); setError(e); if (!e) onNext(v); }}>황금연휴 찾기</Button>
      </div>
    </div>
  );
}
