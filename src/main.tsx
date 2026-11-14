import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/screens.css"; // Figma 화면별 스타일 (global 뒤에 와야 덮어쓴다)
import "./styles/motion.css"; // 인터랙션 모션 (맨 뒤: 위 스타일의 transition 을 덮어쓴다)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
