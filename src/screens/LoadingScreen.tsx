import { useEffect } from "react";
import Illustration from "../components/Illustration";
import { DotLoader } from "../ui";

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="screen screen--center">
      <Illustration size={140} />
      <h2 className="q">황금연휴를 찾고 있어요</h2>
      <p className="lead">공휴일과 주말을 엮는 중이에요</p>
      <DotLoader />
    </div>
  );
}
