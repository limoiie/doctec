import React from "react";
import { Routes, Route } from 'react-router-dom';
import "./App.css";
import { Login } from "./pages/Login";
import {Register} from "./pages/Register";
import {MainWin} from "./pages/MainWin";
import {EmbeddingDetectionPage} from "./pages/EmbeddingDetectionPage.js";
import {EmbeddingDetectionHistoryPage} from "./pages/EmbeddingDetectionHistoryPage.js";

function App() {
  return (
    <>
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mainwin/*" element={<MainWin />}>
          <Route path="detection" element={<EmbeddingDetectionPage />} />
          <Route path="history" element={<EmbeddingDetectionHistoryPage />} />
        </Route>
        
      </Routes>
    </div>
    </>
  );
}

export default App;
