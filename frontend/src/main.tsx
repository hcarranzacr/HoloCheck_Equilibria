import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 [Main] Starting application initialization');
console.log('📍 [Main] Current URL:', window.location.href);
console.log('📍 [Main] Pathname:', window.location.pathname);

const rootElement = document.getElementById("root")!;
console.log('✅ [Main] Root element found:', !!rootElement);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('✅ [Main] React app rendered');
