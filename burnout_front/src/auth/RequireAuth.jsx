/**
 * RequireAuth.jsx
 * @description Componentă de protecție a rutelor (Route Guard).
 * Verifică dacă utilizatorul este autentificat înainte de a randa componenta cerută.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}