import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Page from "@/app/dashboard/page";

function App() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<Page />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
