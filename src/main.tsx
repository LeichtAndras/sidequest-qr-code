import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

/**
 * Önálló QR-oldal: nincs router, nincs auth, nincs onboarding.
 * A helyszínt a `?v=` query paraméter hordozza, bármelyik útvonalon
 * (`/q?v=...` a kanonikus, de a `/` is működik).
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
