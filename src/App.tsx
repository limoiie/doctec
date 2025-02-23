import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "@/app/login/page";
import DashboardPage from "@/app/dashboard/page";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider } from "@/contexts/auth-context";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={<Navigate to="/dashboard/detection/task-job" replace />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
