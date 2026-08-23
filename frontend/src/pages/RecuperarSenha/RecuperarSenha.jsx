import logo from "../../assets/logo.png";

import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../../services/api";

export default function RecuperarSenha() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [tipoSolicitacao, setTipoSolicitacao] = useState("NOVA_SENHA");

  const [mensagem, setMensagem] = useState("");

  const [erro, setErro] = useState("");

  const [carregando, setCarregando] = useState(false);

    async function solicitarNovaSenha() {

    setMensagem("");

    setErro("");

    if (!email.trim()) {

      setErro(
        "Informe o e-mail cadastrado."
      );

      return;
    }

    try {

      setCarregando(true);

      const { data } = await api.post(
        "/usuarios/solicitar-acesso",
        {
          email: email.trim(),
          tipo: "NOVA_SENHA"
        }
      );

      setMensagem(
        data.message ||
        "Solicitação registrada com sucesso."
      );

      setEmail("");

    } catch (error) {

      console.error(error);

      setErro(
        error.response?.data?.error ||
        "Erro ao solicitar recuperação de senha."
      );

    } finally {

      setCarregando(false);

    }

  }

  async function solicitarNovoAcesso() {

    setMensagem("");

    setErro("");

    if (!email.trim()) {

      setErro(
        "Informe o e-mail para solicitar um novo acesso."
      );

      return;
    }

    try {

      setCarregando(true);

      const { data } = await api.post(
        "/usuarios/solicitar-acesso",
        {
          email: email.trim(),
          tipo: "ATIVACAO_PERFIL"
        }
      );

      setMensagem(
        data.message ||
        "Solicitação de novo acesso registrada com sucesso."
      );

      setEmail("");

    } catch (error) {

      console.error(error);

      setErro(
        error.response?.data?.error ||
        "Erro ao solicitar novo acesso."
      );

    } finally {

      setCarregando(false);

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

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            disabled={carregando}

            className="
              border
              rounded-full
              px-5
              py-3
              outline-none
              focus:ring-2
              focus:ring-green-700
            "
          />

          {erro && (

            <p
              className="
                text-red-600
                text-sm
                text-center
                font-semibold
              "
            >
              {erro}
            </p>

          )}

          {mensagem && (

            <p
              className="
                text-green-700
                text-sm
                text-center
                font-semibold
              "
            >
              {mensagem}
            </p>

          )}

                    <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            <button

              type="button"

              onClick={solicitarNovaSenha}

              disabled={carregando}

              className="
                bg-green-900
                hover:bg-green-800
                disabled:bg-gray-400
                text-white
                rounded-full
                py-3
                font-semibold
              "
            >

              Recuperar Senha

            </button>

            <button

              type="button"

              onClick={solicitarNovoAcesso}

              disabled={carregando}

              className="
                bg-slate-700
                hover:bg-slate-800
                disabled:bg-gray-400
                text-white
                rounded-full
                py-3
                font-semibold
              "
            >

              Ativar Perfil

            </button>

          </div>

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