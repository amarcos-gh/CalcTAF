import {Link, useLocation, useNavigate} from "react-router-dom";

import {useEffect, useState} from "react";

import api from "../services/api";

export default function MainLayout({
  children
}) {

  const navigate = useNavigate();

  const location = useLocation();

  const [campanhas, setCampanhas] = useState([]);

  const [subunidades, setSubunidades] = useState([]);

  const [relatoriosAberto, setRelatoriosAberto] = useState(false);

  const [geralAberto, setGeralAberto] = useState(false);

  const [suAberto, setSuAberto] = useState(false);

  const [tafAberto, setTafAberto] = useState(null);

  const [suSelecionada, setSuSelecionada] = useState(null);

  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [coletasAberto, setColetasAberto] = useState(false);

  const [aba, setAba] = useState("importar");

  const perfil = localStorage.getItem("perfil");

  const isGeral = perfil === "GERAL";

  const podeMilitares =
    isGeral ||
    perfil === "ADMINISTRADOR" ||
    perfil === "OPERADOR" ||
    perfil === "AVALIADOR";


  const podeAvaliacoes =
    isGeral ||
    perfil === "ADMINISTRADOR" ||
    perfil === "AVALIADOR";


  const podeColetas =
    isGeral ||
    perfil === "ADMINISTRADOR";


  const podeRelatorios =
    isGeral ||
    perfil === "ADMINISTRADOR" ||
    perfil === "OPERADOR" ||
    perfil === "AVALIADOR";


  const podeConfiguracoes =
    isGeral ||
    perfil === "ADMINISTRADOR";
  
  useEffect(() => {

    carregarDados();

  }, []);  

async function carregarDados() {

  try {

    const campanhasResponse =

      await api.get(
        "/campanhas"
      );

    setCampanhas(
      campanhasResponse.data
    );

    const omIdAtual =

      localStorage.getItem(
        "omId"
      );

    if (

      omIdAtual

    ) {

      const subunidadesResponse =

        await api.get(

          "/subunidades",

          {

            params: {

              omId:

                omIdAtual
            }
          }
        );

      setSubunidades(

        subunidadesResponse.data
      );
    }

  } catch (error) {

    console.error(error);
  }
}

return (

  <div className="min-h-screen bg-slate-100 flex">

    <aside
      className="
        layout-sidebar
        w-72
        bg-green-900
        text-white
        p-6
        overflow-visible
        flex
        flex-col
      "
    >

      <h1 className="text-3xl font-bold mb-8">

        CalcTAF Web

      </h1>

      <div
        className="
          mb-8
          pb-4
          border-b
          border-green-700
        "
      >

        <p
          className="
            text-sm
            text-green-300
            mb-1
            uppercase
            tracking-wider
          "
        >

          Organização Militar

        </p>

        <p
          className="
            text-white
            text-lg
            font-semibold
          "
        >

          {localStorage.getItem("nomeOM")}

        </p>

      </div>
      
      <nav className="space-y-2">

        <Link
          to={podeMilitares ? "/militares" : "#"}
          onClick={(e) => {
            if (!podeMilitares) {
              e.preventDefault();
            }
          }}
          title={
            podeMilitares
              ? ""
              : "Acesso não autorizado"
          }
          className={`
            block
            rounded-xl
            p-3
            ${!podeMilitares ? "cursor-not-allowed" : ""}
            ${
              location.pathname === "/militares"
                ? "bg-green-800 text-yellow-300 font-bold"
                : podeMilitares
                  ? "hover:bg-green-800"
                  : ""
            }
          `}
        >
          👥 MILITARES
        </Link>

        <Link
          to={podeAvaliacoes ? "/avaliacoes" : "#"}
          onClick={(e) => {
            if (!podeAvaliacoes) {
              e.preventDefault();
            }
          }}
          title={
            podeAvaliacoes
              ? ""
              : "Acesso não autorizado"
          }
          className={`
            block
            rounded-xl
            p-3
            ${!podeAvaliacoes ? "cursor-not-allowed" : ""}
            ${
              location.pathname === "/avaliacoes"
                ? "bg-green-800 text-yellow-300 font-bold"
                : podeAvaliacoes
                  ? "hover:bg-green-800"
                  : ""
            }
          `}
        >
          📝 AVALIAÇÕES
        </Link>

        <button
          type="button"
          onClick={() => {
            if (podeColetas) {
              navigate("/coletas");
            }
          }}
          title={
            podeColetas
              ? ""
              : "Acesso não autorizado"
          }
          className={`
            w-full
            text-left
            rounded-xl
            p-3
            ${!podeColetas ? "cursor-not-allowed" : ""}
            ${
              location.pathname === "/coletas"
                ? "bg-green-800 text-yellow-300 font-bold"
                : podeColetas
                  ? "hover:bg-green-800"
                  : ""
            }
          `}
        >
          📥 COLETAS
        </button>

        <button
          type="button"
          onClick={() => {
            if (podeRelatorios) {
              navigate("/relatorios");
            }
          }}
          title={
            podeRelatorios
              ? ""
              : "Acesso não autorizado"
          }
          className={`
            w-full
            text-left
            rounded-xl
            p-3
            ${!podeRelatorios ? "cursor-not-allowed" : ""}
            ${
              location.pathname === "/relatorios"
                ? "bg-green-800 text-yellow-300 font-bold"
                : podeRelatorios
                  ? "hover:bg-green-800"
                  : ""
            }
          `}
        >
          📊 RELATÓRIOS
        </button>

        <button
          type="button"
          onClick={() => {
            if (podeConfiguracoes) {
              navigate("/configuracoes");
            }
          }}
          title={
            podeConfiguracoes
              ? ""
              : "Acesso não autorizado"
          }
          className={`
            w-full
            text-left
            rounded-xl
            p-3
            ${!podeConfiguracoes ? "cursor-not-allowed" : ""}
            ${
              location.pathname === "/configuracoes"
                ? "bg-green-800 text-yellow-300 font-bold"
                : podeConfiguracoes
                  ? "hover:bg-green-800"
                  : ""
            }
          `}
        >
          ⚙️ CONFIGURAÇÕES
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="
            block
            rounded-xl
            p-3
            hover:bg-green-800
            text-left
            w-full
          "
        >
          ❌ SAIR
        </button>

      </nav>

     </aside>

    <main
      className="
        layout-main
        flex-1
        p-6
      "
    >

      {children}

    </main>

    </div>
  );
}