console.log("hello world");
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

const data = (window as any).__INITIAL_DATA__ || {};
hydrateRoot(document.getElementById("root")!, <App initialData={data} />);
