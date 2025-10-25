import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDatabase } from "./db/database";

// Initialize IndexedDB on app start
initializeDatabase().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
