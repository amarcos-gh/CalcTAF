import logo from "../../assets/logo.png";

import { useNavigate } from "react-router-dom";

export default function RecuperarSenha() {

  const navigate = useNavigate();

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

            Recuperar Senha

          </p>

          <p
            className="
              text-sm
              text-gray-500
              mb-8
              text-center
            "
          >

            Informe o e-mail cadastrado para recuperar sua senha.

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

            className="
              border
              rounded-full
              px-5
              py-3
            "
          />

          <button

            type="button"

            className="
              bg-green-900
              hover:bg-green-800
              text-white
              rounded-full
              py-3
            "
          >

            Recuperar Senha

          </button>

          <button

            type="button"

            onClick={() => navigate("/")}

            className="
              text-sm
              text-green-900
            "
          >

            Voltar

          </button>

        </div>

      </div>

    </div>

  );
}