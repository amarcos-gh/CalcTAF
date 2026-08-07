import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  permissoes
}) {

  const perfil = localStorage.getItem("perfil");

  if (!perfil) {
    return <Navigate to="/" replace />;
  }

  // Perfil GERAL possui acesso total
  if (perfil === "GERAL") {
    return children;
  }

  if (!permissoes.includes(perfil)) {
    return <Navigate to="/" replace />;
  }

  return children;

}