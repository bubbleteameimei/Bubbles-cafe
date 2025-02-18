import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[Client] Starting application...");

const root = document.getElementById("root");
if (!root) {
  console.error("[Client] Root element not found");
  throw new Error("Root element not found");
}

console.log("[Client] Mounting React application...");
createRoot(root).render(<App />);
console.log("[Client] React application mounted successfully");