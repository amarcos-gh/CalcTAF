import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import LoginColeta from "./pages/coleta/LoginColeta";

import AplicacaoColeta from "./pages/coleta/AplicacaoColeta";

import Login from "./pages/Login/Login";

import Militares from "./pages/Militares/Militares";

import Avaliacoes from "./pages/Avaliacoes/Avaliacoes";

import Coletas from "./pages/coleta/Coletas";

import Relatorios from "./pages/Relatorios/Relatorios";

import Configuracoes from "./pages/Configuracoes/Configuracoes";

import RecuperarSenha from "./pages/RecuperarSenha/RecuperarSenha";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route

          path="/"

          element={<Login />}

        />

        <Route
          path="/militares"
          element={
            <ProtectedRoute permissoes={["ADMINISTRADOR", "OPERADOR"]}>
              <MainLayout>
                <Militares />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/avaliacoes"
          element={
            <ProtectedRoute permissoes={["ADMINISTRADOR", "AVALIADOR"]}>
              <MainLayout>
                <Avaliacoes />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/coletas"
          element={
            <ProtectedRoute permissoes={["ADMINISTRADOR", "AVALIADOR"]}>
              <MainLayout>
                <Coletas />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/relatorios"
          element={
            <ProtectedRoute
              permissoes={[
                "ADMINISTRADOR",
                "OPERADOR",
                "AVALIADOR"
              ]}
            >
              <MainLayout>
                <Relatorios />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute permissoes={["ADMINISTRADOR"]}>
              <MainLayout>
                <Configuracoes />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route

          path="/recuperar-senha"

          element={<RecuperarSenha />}

        />

        <Route

          path="/coleta/login"

          element={<LoginColeta />}

        />

        <Route

          path="/coleta"

          element={<Navigate to="/coleta/login" />}

        />

        <Route

          path="/coleta/aplicacao"

          element={<AplicacaoColeta />}

        />

        <Route

          path="*"

          element={<Navigate to="/" />}

        />

      </Routes>

    </BrowserRouter>

  );
}