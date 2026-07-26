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

        {(perfil === "ADMINISTRADOR" || perfil === "OPERADOR") && (
          <Link
            to="/militares"
            className={`
              block
              rounded-xl
              p-3
              ${
                location.pathname === "/militares"
                  ? "bg-green-800 text-yellow-300 font-bold"
                  : "hover:bg-green-800"
              }
            `}
          >
            Militares
          </Link>
        )}

        {(perfil === "ADMINISTRADOR" || perfil === "AVALIADOR") && (
          <Link
            to="/avaliacoes"
            className={`
              block
              rounded-xl
              p-3
              ${
                location.pathname === "/avaliacoes"
                  ? "bg-green-800 text-yellow-300 font-bold"
                  : "hover:bg-green-800"
              }
            `}
          >
            Avaliações
          </Link>
        )}

        {(perfil === "ADMINISTRADOR" || perfil === "AVALIADOR") && (
          <button
            onClick={() => navigate("/coletas")}
            className={`
              w-full
              text-left
              rounded-xl
              p-3
              ${
                location.pathname === "/coletas"
                  ? "bg-green-800 text-yellow-300 font-bold"
                  : "hover:bg-green-800"
              }
            `}
          >
            Coletas
          </button>
        )}

        {(perfil === "ADMINISTRADOR" ||
          perfil === "OPERADOR" ||
          perfil === "AVALIADOR") && (
          <button
            onClick={() => navigate("/relatorios")}
            className={`
              w-full
              text-left
              rounded-xl
              p-3
              ${
                location.pathname === "/relatorios"
                  ? "bg-green-800 text-yellow-300 font-bold"
                  : "hover:bg-green-800"
              }
            `}
          >
            Relatórios
          </button>
        )}

        <button
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
          ❌ Sair
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