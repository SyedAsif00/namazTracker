import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./firebase.config"; // Import the firebase.js file to ensure initialization

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
