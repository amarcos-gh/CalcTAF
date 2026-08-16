import logo from "../../assets/logo.png";

import {useEffect, useState} from "react";

import {useNavigate} from "react-router-dom";

import api from "../../services/api";

export default function CadastroUsuario() {

  const navigate = useNavigate();

  const [

    oms,

    setOms

  ] = useState([]);

  const [

    buscaOM,

    setBuscaOM

  ] = useState("");

  const [

    omSelecionada,

    setOmSelecionada

  ] = useState(null);

  const [

    nome,

    setNome

  ] = useState("");

  const [

    email,

    setEmail

  ] = useState("");

  const [

    senha,

    setSenha

  ] = useState("");

  const [

    confirmarSenha,

    setConfirmarSenha

  ] = useState("");

  const [

    mensagem,

    setMensagem

  ] = useState("");

  useEffect(() => {

    carregarOMs();

  }, []);

  async function carregarOMs() {

    try {

      const response =

        await api.get(

          "/oms"
        );

      setOms(

        response.data
      );

    } catch (error) {

      console.error(

        error
      );
    }
  }

  const omsFiltradas =

    !buscaOM.trim()

      ?

      oms

      :

      oms.filter((om) => {

        const termo =

          buscaOM
            .toLowerCase()
            .trim();

        return (

          om.codom
            .startsWith(
              termo
            )

          ||

          om.sigla
            .toLowerCase()
            .includes(
              termo
            )
        );
      });

    async function criarConta() {

    if (!omSelecionada) {

        setMensagem(

        "Selecione uma OM."
        );

        return;
    }

    if (

        senha !==

        confirmarSenha

    ) {

        setMensagem(

        "As senhas não conferem."
        );

        return;
    }

    try {

        await api.post(

        "/auth/cadastrar",

        {

            nome,

            email,

            senha,

            omId:

            omSelecionada.id
        }
        );

        alert(

        "Conta criada com sucesso. Seu cadastro está PENDENTE aguardando atribuição e ativação do perfil."
        );

        navigate("/");

    } catch (error) {

        setMensagem(

        error.response?.data?.error ||

        "Erro ao criar conta."
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

            Criar Conta

          </p>

          <p
            className="
              text-sm
              text-gray-500
              mb-8
              text-center
            "
          >

            Solicite a atribuição de perfil ADMINISTRADOR para o GERAL

          </p>

        </div>

        <div
            className="
                flex
                flex-col
                gap-4
            "
            >

            <div className="relative">

            <input

                type="text"

                placeholder="Digite CODOM ou Sigla da OM"

                value={buscaOM}

                onChange={(e) => {

                setBuscaOM(

                    e.target.value
                );

                setOmSelecionada(

                    null
                );
                }}

                className="
                border
                rounded-full
                px-5
                py-3
                w-full
                "
            />

            {

                buscaOM &&

                omsFiltradas.length > 0 && (

                <div
                    className="
                    absolute
                    top-full
                    left-0
                    right-0
                    bg-white
                    border
                    rounded-xl
                    shadow-lg
                    max-h-60
                    overflow-y-auto
                    z-50
                    "
                >

                    {

                    omsFiltradas.map(

                        (om) => (

                        <button

                            key={om.id}

                            type="button"

                            onClick={() => {

                            setBuscaOM(

                                `${om.codom} - ${om.sigla}`
                            );

                            setOmSelecionada(

                                om
                            );
                            }}

                            className="
                            w-full
                            text-left
                            px-4
                            py-2
                            hover:bg-slate-100
                            "
                        >

                            {om.codom} - {om.sigla}

                        </button>
                        )
                    )
                    }

                </div>
                )
            }

            </div>

            <input

            type="text"

            placeholder="Nome Completo"

            value={nome}

            onChange={(e) =>

                setNome(
                e.target.value.toUpperCase()
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

            <input

            type="password"

            placeholder="Confirmar Senha"

            value={confirmarSenha}

            onChange={(e) =>

                setConfirmarSenha(
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

            onClick={criarConta}

            className="
                bg-green-900
                hover:bg-green-800
                text-white
                rounded-full
                py-3
            "
            >

            Criar Conta

          </button>

          {

            mensagem &&

            <p

                className="
                text-red-600
                text-center
                text-sm
                "
            >

                {mensagem}

            </p>
          }

          <button

            type="button"

            onClick={() =>

                navigate("/")
            }

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