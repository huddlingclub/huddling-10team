import { Back, ProgressBar } from "../ui";

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="topbar">
      <button type="button" className="ui-icon-btn" aria-label="뒤로" onClick={onBack}><Back /></button>
      <strong>{title}</strong>
    </div>
  );
}

export function StepBar({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <div className="stepbar">
      <button type="button" className="ui-icon-btn" aria-label="뒤로" onClick={onBack}><Back /></button>
      <ProgressBar value={(step / total) * 100} />
      <span>{step}/{total}</span>
    </div>
  );
}
