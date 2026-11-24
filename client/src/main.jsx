/**
 * =============================================================================
 * FILE: client/src/main.jsx
 * ROLE: React entry — mount <App /> into #root
 * =============================================================================
 */
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "normalize.css";
import App from "./App/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
