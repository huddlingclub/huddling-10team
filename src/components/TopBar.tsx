import backIcon from "../assets/icons/back.svg";
import { ProgressBar } from "../ui";

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="nav__back" aria-label="뒤로" onClick={onClick}>
      <img src={backIcon} width={24} height={24} alt="" />
    </button>
  );
}

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="topbar">
      <BackButton onClick={onBack} />
      <strong>{title}</strong>
    </div>
  );
}

export function StepBar({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <div className="stepbar">
      <BackButton onClick={onBack} />
      <ProgressBar value={(step / total) * 100} />
      <span>{step}/{total}</span>
    </div>
  );
}
