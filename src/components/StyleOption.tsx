import checkWhite from "../assets/icons/check-white.svg";
import radio from "../assets/icons/radio.svg";

interface Props {
  icon: string;
  title: string;
  desc: string;
  /** 인디케이터 막대 개수: 1이면 긴 막대 하나, 그 외는 작은 막대 N개 */
  bars: 1 | 6;
  on: boolean;
  onClick: () => void;
}

export default function StyleOption({ icon, title, desc, bars, on, onClick }: Props) {
  return (
    <button type="button" className={`style-opt ${on ? "is-on" : ""}`} aria-pressed={on} onClick={onClick}>
      <span className="style-opt__icon"><img src={icon} width={22} height={22} alt="" /></span>
      <span className="style-opt__text">
        <b>{title}</b>
        <span>{desc}</span>
        <span className={`style-opt__bars ${bars === 1 ? "is-long" : ""}`} aria-hidden>
          {Array.from({ length: bars }, (_, i) => <i key={i} />)}
        </span>
      </span>
      {on
        ? <span className="style-opt__radio"><img src={checkWhite} width={14} height={14} alt="" /></span>
        : <img src={radio} width={24} height={24} alt="" />}
    </button>
  );
}
