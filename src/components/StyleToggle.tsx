import type { VacationStyle } from "../types/recommendation";
import { Plane, SelectCard, Sun } from "../ui";

interface Props {
  value: VacationStyle;
  onChange: (v: VacationStyle) => void;
}

export default function StyleToggle({ value, onChange }: Props) {
  return (
    <div className="field">
      <span className="label">휴가 성향</span>
      <div className="stack">
        <SelectCard icon={<Plane />} title="원기옥 성향" desc="입력한 연차를 한 번에 몰아서 사용"
          on={value === "wonkiok"} onClick={() => onChange("wonkiok")} />
        <SelectCard icon={<Sun />} title="단타 성향" desc="연차를 여러 번 나눠서 사용"
          on={value === "dandta"} onClick={() => onChange("dandta")} />
      </div>
    </div>
  );
}
