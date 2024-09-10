import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./firebase.config";
if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(() => {});
  resizeObserver.observe(document.body);
}
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
