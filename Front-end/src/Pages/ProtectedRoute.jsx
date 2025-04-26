// ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // null means loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/auth/check", { withCredentials: true }) // very important for session cookies
      .then((res) => {
        if (res.data.authenticated) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setIsAuth(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
