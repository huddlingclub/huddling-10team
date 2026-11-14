/** TODO: 마법사 펭귄 일러스트로 교체 (디자인 파일의 "마법사 펭귄" 에셋) */
export default function Illustration({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`illust ${className}`} style={{ width: size, height: size }} aria-hidden>
      <span>일러스트</span>
    </div>
  );
}
