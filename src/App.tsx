import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Page from "@/app/dashboard/page";
import { useEel } from "@/hooks/use-eel";

function App() {
  const { eel } = useEel();

  useEffect(() => {
    eel.set_host("ws://localhost:8888");
    console.log("Set Eel host to ws://localhost:8888");
  }, []); // The empty array as the second argument ensures this runs only once after the initial render.

  return (
    <Routes>
      <Route path="/dashboard/*" element={<Page />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
