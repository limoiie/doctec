import React, { useEffect } from "react";

import "./App.css";
import Page from "@/app/dashboard/page";
import { useEel } from "@/hooks/use-eel";

// noinspection JSUnresolvedReference
function App() {
  const { eel } = useEel();

  useEffect(() => {
    eel.set_host("ws://localhost:8888");
  }, []); // The empty array as the second argument ensures this runs only once after the initial render.

  return (
    <>
      <Page />
    </>
  );
}

export default App;
