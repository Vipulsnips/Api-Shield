import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import CreateService from "./pages/CreateService";
import Signup from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />}></Route>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/service/create"
        element={
          <ProtectedRoute>
            <CreateService />
          </ProtectedRoute>
        }
      ></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;
