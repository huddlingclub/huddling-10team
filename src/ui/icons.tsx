const base = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;
type P = { size?: number };
export const Check = ({ size = 14 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" {...base} strokeWidth="2.4" /></svg>
);
export const Plus = ({ size = 20 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M5 12h14M12 5v14" {...base} strokeWidth="1.67" /></svg>
);
export const Minus = ({ size = 20 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M5 12h14" {...base} strokeWidth="1.67" /></svg>
);
export const Back = ({ size = 24 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" {...base} strokeWidth="1.67" /></svg>
);
export const Sparkle = ({ size = 14 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M12 3 Q12 12 21 12 Q12 12 12 21 Q12 12 3 12 Q12 12 12 3 Z" fill="currentColor" /></svg>
);
export const Sun = ({ size = 24 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2" {...base} strokeWidth="1.67" /></svg>
);
export const Plane = ({ size = 24 }: P) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24"><path d="M2 16l8-2 4-8 2 1-2 6 6-1 1 2-18 4z" {...base} strokeWidth="1.67" /></svg>
);
