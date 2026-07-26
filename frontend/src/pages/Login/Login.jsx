import logo from "../../assets/logo.png";

import { useNavigate } from "react-router-dom";

import { useState } from "react";

import api from "../../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [

    email,

    setEmail

  ] = useState("");

  const [

    senha,

    setSenha

  ] = useState("");

  const [

    mensagem,

    setMensagem

  ] = useState("");

  async function entrar() {

    try {

      const response =

        await api.post(

          "/auth/login",

          {

            email,

            senha

          }
        );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(

        "usuarioId",

        response.data.usuarioId
      );

      localStorage.setItem(

        "nomeUsuario",

        response.data.nome
      );

      localStorage.setItem(

        "perfil",

        response.data.perfil
      );

      localStorage.setItem(

        "omId",

        response.data.omId
      );

      localStorage.setItem(

        "nomeOM",

        response.data.nomeOM
      );

      localStorage.setItem(

        "codom",

        response.data.codom
      );

      navigate(

        "/militares"
      );

    } catch (error) {

      setMensagem(

        error.response?.data?.error ||

        "Erro ao fazer login."
      );
    }
  }

  return (

    <div
      className="
        min-h-screen
        bg-green-900
        flex
        flex-col
        items-center
        justify-center
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          w-full
          max-w-md
        "
      >

        <div className="flex flex-col items-center">

          <img

            src={logo}

            alt="CalcTAF"

            className="w-32 h-32 mb-4"
          />

          <p
            className="
              text-xl
              font-semibold
              text-green-900
              mb-1
            "
          >

            CalcTAF Web

          </p>

          <p
            className="
              text-sm
              text-gray-500
              mb-8
            "
          >

            Sistema de Controle do Teste de Aptidão Física

          </p>

        </div>

        <div
          className="
            flex
            flex-col
            gap-4
          "
        >

          <input

            type="email"

            placeholder="E-mail"

            value={email}

            onChange={(e) =>

              setEmail(
                e.target.value
              )
            }

            className="
              border
              rounded-full
              px-5
              py-3
            "
          />

          <input

            type="password"

            placeholder="Senha"

            value={senha}

            onChange={(e) =>

              setSenha(
                e.target.value
              )
            }

            className="
              border
              rounded-full
              px-5
              py-3
            "
          />

          <button

            type="button"

            onClick={entrar}

            className="
              bg-green-900
              hover:bg-green-800
              text-white
              rounded-full
              py-3
            "
          >

            Entrar

          </button>

          <div
            className="
                mt-5
                text-center
                text-sm
            "
            >

            <button

                type="button"

                className="block mx-auto"

                onClick={() =>

                navigate(
                    "/cadastro-usuario"
                )
                }

            >

                Criar Conta

            </button>

            <button

                type="button"

                className="block mx-auto mt-2"

                onClick={() =>

                navigate(
                    "/recuperar-senha"
                )
                }

            >

                Esqueceu a senha?

            </button>

            </div>

          {

            mensagem &&

            <p className="text-red-600 text-center">

              {mensagem}

            </p>

          }

        </div>

      </div>

      <div
        className="
            mt-1
            w-full
            max-w-md
            text-right
            text-white
            text-xs
        "
        >

        © 2026 STen Antonio Marcos

        </div>

    </div>

  );
}