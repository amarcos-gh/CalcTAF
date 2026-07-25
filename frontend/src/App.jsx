import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import LoginColeta from "./pages/coleta/LoginColeta";

import AplicacaoColeta from "./pages/coleta/AplicacaoColeta";

import Login from "./pages/Login/Login";

import Militares from "./pages/Militares/Militares";

import Avaliacoes from "./pages/Avaliacoes/Avaliacoes";

import Coletas from "./pages/coleta/Coletas";

import Relatorios from "./pages/Relatorios/Relatorios";

import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario";

import RecuperarSenha from "./pages/RecuperarSenha/RecuperarSenha";

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

            <MainLayout>

              <Militares />

            </MainLayout>

          }

        />

        <Route

          path="/avaliacoes"

          element={

            <MainLayout>

              <Avaliacoes />

            </MainLayout>

          }

        />

        <Route

          path="/coletas"

          element={

            <MainLayout>

              <Coletas />

            </MainLayout>

          }

        />

        <Route

          path="/relatorios"

          element={

            <MainLayout>

              <Relatorios />

            </MainLayout>

          }

        />

        <Route

          path="/cadastro-usuario"

          element={<CadastroUsuario />}

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