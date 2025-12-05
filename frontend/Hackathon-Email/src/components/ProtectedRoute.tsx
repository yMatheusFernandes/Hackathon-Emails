import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = localStorage.getItem("auth") === "true";

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
