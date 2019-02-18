import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { DatabaseProvider } from "./db";
import App from './App'
import './index.css'
const rootElement = document.getElementById("root");
ReactDOM.render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>,
  rootElement
);
