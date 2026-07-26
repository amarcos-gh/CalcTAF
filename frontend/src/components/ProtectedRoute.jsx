import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  permissoes
}) {

  const perfil = localStorage.getItem("perfil");

  if (!perfil) {
    return <Navigate to="/" replace />;
  }

  if (!permissoes.includes(perfil)) {
    return <Navigate to="/" replace />;
  }

  return children;
}