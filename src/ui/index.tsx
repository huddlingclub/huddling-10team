import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { useEffect } from "react";
import { Check, Minus, Plus } from "./icons";
import "./ui.css";

export * from "./icons";

export const Button = ({ variant = "primary", className = "", ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) => (
  <button className={`ui-btn ui-btn--${variant} ${className}`} {...p} />
);

export const SmallButton = ({ on, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) => (
  <button className={`ui-small ${on ? "ui-small--on" : ""}`} {...p} />
);

export const Field = (p: InputHTMLAttributes<HTMLInputElement>) => <input className="ui-field" {...p} />;

export function Stepper({ value, onChange, min = 1, max = 99, unit = "개" }:
  { value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }) {
  return (
    <div className="ui-stepper">
      <button type="button" className="ui-stepper__btn" aria-label="줄이기" disabled={value <= min}
        onClick={() => onChange(value - 1)}><Minus /></button>
      <span className="ui-stepper__value">{value}<small>{unit}</small></span>
      <button type="button" className="ui-stepper__btn ui-stepper__btn--add" aria-label="늘리기" disabled={value >= max}
        onClick={() => onChange(value + 1)}><Plus /></button>
    </div>
  );
}

export const Chip = ({ on, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) => (
  <button type="button" className={`ui-chip ${on ? "ui-chip--on" : ""}`} aria-pressed={on} {...p}>
    {on && <Check />}{children}
  </button>
);

export const Badge = ({ children }: { children: ReactNode }) => <span className="ui-badge">{children}</span>;
export const Tag = ({ children }: { children: ReactNode }) => <span className="ui-tag">{children}</span>;

export const ProgressBar = ({ value, thick }: { value: number; thick?: boolean }) => (
  <div className={`ui-bar ${thick ? "ui-bar--thick" : ""}`} role="progressbar" aria-valuenow={value}>
    <i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

export function SelectCard({ icon, title, desc, on, onClick }:
  { icon: ReactNode; title: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`ui-select-card ${on ? "ui-select-card--on" : ""}`}
      aria-pressed={on} onClick={onClick}>
      <span className="ui-select-card__icon">{icon}</span>
      <span className="ui-select-card__text"><b>{title}</b><span>{desc}</span></span>
      <span className="ui-radio">{on && <Check />}</span>
    </button>
  );
}

export const Card = ({ focus, children }: { focus?: boolean; children: ReactNode }) => (
  <article className={`ui-card ${focus ? "ui-card--focus" : ""}`}>{children}</article>
);

export type DayKind = "weekday" | "sat" | "sun" | "holiday" | "leave";
export const DayCell = ({ day, kind, label, band }: { day: number; kind: DayKind; label?: string; band?: boolean }) => (
  <div className={`ui-cell ui-cell--${kind}`}>
    {band && <span className="ui-cell__band" />}
    <span className="ui-cell__num">{day}</span>
    <span className="ui-cell__label">{label ?? "\u00a0"}</span>
  </div>
);

export const DotLoader = () => <div className="ui-loader" aria-hidden><i /><i /><i /></div>;

export function Toast({ message, onClose, ms = 1800 }: { message: string; onClose: () => void; ms?: number }) {
  useEffect(() => { const t = setTimeout(onClose, ms); return () => clearTimeout(t); }, [message, ms, onClose]);
  return <div className="ui-toast" role="status">{message}</div>;
}
