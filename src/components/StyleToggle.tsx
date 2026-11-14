import type { VacationStyle } from "../types/recommendation";

const OPTIONS: { value: VacationStyle; title: string; desc: string }[] = [
  { value: "wonkiok", title: "원기옥 성향", desc: "입력한 연차를 한 번에 몰아서 사용" },
  { value: "dandta", title: "단타 성향", desc: "연차를 여러 번 나눠서 사용" },
];

interface Props {
  value: VacationStyle;
  onChange: (v: VacationStyle) => void;
}

export default function StyleToggle({ value, onChange }: Props) {
  return (
    <div className="field">
      <span className="label">휴가 성향</span>
      <div className="radio-group">
        {OPTIONS.map((o) => (
          <label key={o.value} className={`radio-card ${value === o.value ? "is-on" : ""}`}>
            <input
              type="radio"
              name="style"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span>
              <strong>{o.title}</strong>
              <small>{o.desc}</small>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
