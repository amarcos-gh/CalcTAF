import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { obterColeta } from "../database/indexedDB";

export default function ProtectedRoute({
  children,
  permissoes,
  exigirColeta = false
}) {

  const perfil =
    localStorage.getItem("perfil");

  const [
    verificandoColeta,
    setVerificandoColeta
  ] = useState(exigirColeta);

  const [
    coletaAutorizada,
    setColetaAutorizada
  ] = useState(!exigirColeta);

  useEffect(() => {

    if (!exigirColeta) {

      return;

    }

    async function verificarColeta() {

      try {

        const coleta =
          await obterColeta();

        setColetaAutorizada(
          !!coleta
        );

      }

      catch (erro) {

        console.error(
          "Erro ao verificar coleta:",
          erro
        );

        setColetaAutorizada(false);

      }

      finally {

        setVerificandoColeta(false);

      }

    }

    verificarColeta();

  }, [exigirColeta]);

  if (exigirColeta && verificandoColeta) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-green-900">

        <div className="bg-white rounded-2xl shadow-xl px-6 py-5">

          <div className="text-green-800 font-semibold">

            Verificando coleta...

          </div>

        </div>

      </div>

    );

  }

  if (!perfil && !exigirColeta) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  if (
    !exigirColeta &&
    perfil !== "GERAL" &&
    !permissoes.includes(perfil)
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  if (
    exigirColeta &&
    !coletaAutorizada
  ) {

    return (
      <Navigate
        to="/coleta/login"
        replace
      />
    );

  }

  return children;

}