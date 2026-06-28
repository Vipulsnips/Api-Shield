import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "./Navbar";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  async function verifyUser() {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      await API.get("/auth/me");
      setAuthenticated(true);
    } catch (err) {
      localStorage.removeItem("token");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    verifyUser();
  }, []);
  if (loading) {
    return <h2>Checking authentication...</h2>;
  }
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
export default ProtectedRoute;
