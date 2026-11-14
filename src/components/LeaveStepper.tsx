import minus from "../assets/icons/minus.svg";
import plus from "../assets/icons/plus.svg";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

/** 01 입력 화면의 남은 연차 스테퍼 (Figma: 76px 높이, 32px 숫자) */
export default function LeaveStepper({ value, onChange, min = 0, max = 30 }: Props) {
  return (
    <div className="lstep">
      <button type="button" className="lstep__btn" aria-label="연차 줄이기" disabled={value <= min}
        onClick={() => onChange(value - 1)}>
        <img src={minus} width={20} height={20} alt="" />
      </button>
      <span className="lstep__value" aria-live="polite">{value}<small>개</small></span>
      <button type="button" className="lstep__btn lstep__btn--add" aria-label="연차 늘리기" disabled={value >= max}
        onClick={() => onChange(value + 1)}>
        <img src={plus} width={20} height={20} alt="" />
      </button>
    </div>
  );
}
