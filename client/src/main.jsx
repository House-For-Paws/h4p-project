/**
 * React entry — mounts <App /> into public/index.html #root.
 * StrictMode double-invokes certain lifecycles in dev only (helps spot side effects).
 */
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css"; // Global layout + variables
import "normalize.css"; // Cross-browser CSS reset
import App from "./App/App"; // Router + route table lives here

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
