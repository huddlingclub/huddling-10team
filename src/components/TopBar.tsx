import backIcon from "../assets/icons/back.svg";

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
