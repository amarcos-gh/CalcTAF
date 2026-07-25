import { useEffect, useState } from "react";

import api from "../../services/api";

export default function Militares() {

  const [militares, setMilitares] = useState([]);

  const [manterPG, setManterPG] = useState(false);

  const [manterSegmento, setManterSegmento] = useState(false);

  const [manterCurso, setManterCurso] = useState(false);

  const [manterSubunidade, setManterSubunidade] = useState(false);

  const [subunidadeInput, setSubunidadeInput] = useState("");

  const [busca, setBusca] = useState("");

  const [militarSelecionado, setMilitarSelecionado] = useState(null);

  const [mensagem, setMensagem] = useState("");

  const [cursos, setCursos] = useState([
    {
      id: 1,
      codigo: "LEMB"
    },

    {
      id: 2,
      codigo: "LEMS/LEMC/LEMCT"
    }
  ]);

  const [subunidades, setSubunidades] = useState([]);

  const [form, setForm] = useState({

    nomeCompleto: "",

    nomeGuerra: "",

    postoGraduacaoId: "",

    segmento: "",

    cursoId: "",

    dataNascimento: "",

    subunidade: ""
  });

  const postosGraduacoes = [

    { id: 1, sigla: "Cel" },

    { id: 2, sigla: "TC" },

    { id: 3, sigla: "Maj" },

    { id: 4, sigla: "Cap" },

    { id: 5, sigla: "1º Ten" },

    { id: 6, sigla: "2º Ten" },

    { id: 7, sigla: "Asp Of" },

    { id: 8, sigla: "ST" },

    { id: 9, sigla: "1º Sgt" },

    { id: 10, sigla: "2º Sgt" },

    { id: 11, sigla: "3º Sgt" },

    { id: 12, sigla: "Cb" },

    { id: 13, sigla: "Sd EP" },

    { id: 14, sigla: "Sd EV" }
  ];

  async function carregarMilitares() {

    try {

      const response =

        await api.get(

          "/militares",

          {

            params: {

              omId:

                localStorage.getItem(
                  "omId"
                )
            }
          }
        );

      setMilitares(
        response.data
      );

    } catch (error) {

      console.error(
        error
      );
    }
  }
  useEffect(() => {

    carregarMilitares();

    carregarSubunidades();

  }, []);

  useEffect(() => {

    return () => {

      setManterSubunidade(
        false
      );
    };

  }, []);

  async function carregarSubunidades() {

    try {

      const response =

        await api.get(

          "/subunidades",

          {

            params: {

              omId:

                localStorage.getItem(
                  "omId"
                )
            }
          }
        );

      setSubunidades(

        response.data
      );

    } catch (error) {

      console.error(

        error
      );
    }
  }
  
  async function cadastrarMilitar(e) {

    e.preventDefault();

    try {

      const militarDuplicado =
        militares.find((militar) => {

          return (
            militar.nomeCompleto
              .toLowerCase()
              .trim() ===
            form.nomeCompleto
              .toLowerCase()
              .trim()
          );
        });

        if (

          militarDuplicado

          &&

          militarDuplicado.id !==
            militarSelecionado?.id

        ) {

          setMensagem(

            "Já existe um militar com este Nome Completo."

          );

          return;

        }

      if (

          militarSelecionado?.id

          &&

          militarSelecionado.nomeCompleto
            .trim()
            .toUpperCase()

            ===

          form.nomeCompleto
            .trim()
            .toUpperCase()

        ) {

        const confirmar =
          window.confirm(

            "Deseja atualizar o cadastro deste militar?"
          );

        if (!confirmar) {

          return;
        }

        try {

          const response =
            await api.put(

              `/militares/${militarSelecionado.id}`,

              {

                nomeCompleto:

                  form.nomeCompleto ||

                  militarSelecionado.nomeCompleto,

                postoGraduacaoId:

                  form.postoGraduacaoId

                    ?

                    Number(
                      form.postoGraduacaoId
                    )

                    :

                    militarSelecionado.postoGraduacao?.id,

                nomeGuerra:

                  form.nomeGuerra ||

                  militarSelecionado.nomeGuerra,

                segmento:

                  form.segmento ||

                  militarSelecionado.segmento,

                cursoId:

                  Number(
                    form.cursoId
                  ) ||

                  militarSelecionado.cursoId,

                dataNascimento:

                  form.dataNascimento ||

                  militarSelecionado.dataNascimento,

                subunidade:

                  subunidadeInput ||

                  militarSelecionado.subunidade?.nome
                }
            );

          setMilitarSelecionado({

            ...response.data
          });

          setMensagem(
            "Cadastro atualizado com sucesso."
          );

          await carregarMilitares();

          return;

        } catch (error) {

          console.error(error);

          setMensagem(
            "Erro ao atualizar cadastro."
          );

          return;
        }
      }
      
      setMilitarSelecionado(
        null
      );

      const response =
        await api.post("/militares", {

          nomeCompleto:
            form.nomeCompleto,

          postoGraduacaoId:
            Number(
              form.postoGraduacaoId
            ),

          nomeGuerra:
            form.nomeGuerra,

          segmento:
            form.segmento,

          cursoId:
            Number(form.cursoId),

          dataNascimento:
            form.dataNascimento,

          subunidade:
            form.subunidade,

          omId:
            Number(
              localStorage.getItem(
                "omId"
              )
            )
        });

      setMensagem(
        "Militar cadastrado com sucesso."
      );

      setMilitarSelecionado(
        response.data
      );

      await carregarMilitares();

      setForm({

        nomeCompleto: "",

        postoGraduacaoId:

          manterPG

            ?

            form.postoGraduacaoId

            :

            "",

        nomeGuerra: "",

        segmento:

          manterSegmento

            ?

            form.segmento

            :

            "",

        cursoId:

          manterCurso

            ?

            form.cursoId

            :

            "",

        dataNascimento: "",

        subunidade:

          manterSubunidade

            ?

            subunidadeInput

            :

            ""
      });

      if (!manterSubunidade) {

        setSubunidadeInput("");
      }

      setBusca("");

      return;

      //carregarMilitares();

    } catch (error) {

      console.error(
        "ERRO FRONTEND:",
        error
      );

      console.error(
        "ERRO BACKEND:",
        error.response?.data
      );

      setMensagem(

        error.response?.data?.error ||

        error.message ||

        "Erro ao cadastrar militar."
      );
    }
  }

  function converterDataBR(dataBR) {

    const partes =
      dataBR.split("/");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  function formatarDataBR(valor) {

    valor =
      valor.replace(/\D/g, "");

    valor =
      valor.replace(
        /(\d{2})(\d)/,
        "$1/$2"
      );

    valor =
      valor.replace(
        /(\d{2})(\d)/,
        "$1/$2"
      );

    return valor;
  }

  const militaresFiltrados =
    militares.filter((militar) => {

      if (!busca.trim()) {
        return false;
      }

      const termo =
        busca.toLowerCase();

      return (

        militar.nomeCompleto
          ?.toLowerCase()
          .includes(termo)

        ||

        militar.nomeGuerra
          ?.toLowerCase()
          .includes(termo)
      );
    });

async function excluirMilitar() {

  if (!militarSelecionado) {

    alert("Selecione um militar para excluir.");

    return;

  }

  if (

    !window.confirm(

      "Confirma a exclusão do militar?"

    )

  ) {

    return;

  }

  try {

    await api.delete(

      `/militares/${militarSelecionado.id}`

    );

    setMensagem(

      "Militar excluído com sucesso!"

    );

    setMilitarSelecionado(null);

    setForm({

      ...form,

      nomeCompleto: "",

      nomeGuerra: "",

      dataNascimento: ""

    });

    carregarMilitares();

  } catch (error) {

    console.error(error);

    alert(

      error.response?.data?.error ||

      error.message ||

      "Erro ao excluir militar."

    );

  }

}

  return (

    <div className="space-y-6">

      {/* CARD CADASTRO */}

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <h2 className="text-2xl font-bold mb-6">

          Cadastro Militar

        </h2>

        {mensagem && (

          <div
            className="
              mb-4
              px-4
              py-3
              rounded-xl
              bg-slate-100
            "
          >

            {mensagem}

          </div>
        )}

        <form
          onSubmit={cadastrarMilitar}
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >

          {/* NOME COMPLETO */}

          <div className="relative">

            <input
              type="text"
              placeholder="Nome Completo"
              value={form.nomeCompleto}
              onChange={(e) => {

                setForm({

                  ...form,

                  nomeCompleto:
                    e.target.value.toUpperCase()
                });

                setBusca(
                  e.target.value
                );
              }}
              className="
                border
                rounded-xl
                p-3
                w-full
              "
              required={!militarSelecionado}
            />

            {busca.trim() &&
                militaresFiltrados.length > 0 && (

                <div
                  className="
                    absolute
                    top-full
                    left-0
                    right-0
                    bg-white
                    border
                    rounded-xl
                    shadow-xl
                    z-[9999]
                    mt-1
                    max-h-60
                    overflow-y-auto
                  "
                >

                {militaresFiltrados.map(
                  (militar) => (

                    <button
                      key={militar.id}
                      type="button"
                      onClick={() => {

                      setMilitarSelecionado(
                        militar
                      );

                      setSubunidadeInput(

                        militar.subunidade?.nome || ""
                      );

                      setBusca("");

                      setForm({

                        ...form,

                        id:
                          militar.id,

                        nomeCompleto:
                          militar.nomeCompleto,

                        nomeGuerra:
                          militar.nomeGuerra || "",

                        postoGraduacaoId:

                          militar.postoGraduacaoId || "",

                        segmento:
                          militar.segmento || "",

                        cursoId:
                          militar.cursoId || "",

                        dataNascimento:

                          militar.dataNascimento

                            ?

                            new Date(
                              militar.dataNascimento
                            ).toLocaleDateString(
                              "pt-BR"
                            )

                            :

                            "",

                        subunidade:

                          militar.subunidade?.nome || ""
                      });
                    }}
          className="
            w-full
            text-left
            p-3
            hover:bg-slate-100
            border-b
          "
          >

            <div className="font-bold">

              {militar.nomeGuerra}

            </div>

            <div className="text-sm text-slate-500">

              {militar.nomeCompleto}

            </div>

          </button>
          )
          )}

          </div>
          )}

          </div>

      {/* POSTO/GRADUAÇÃO + NOME DE GUERRA */}
      <div className="flex flex-col">

        <div className="flex gap-3 items-start">

          <select

            value={form.postoGraduacaoId || ""}

            onChange={(e) =>

              setForm({

                ...form,

                postoGraduacaoId:
                  e.target.value
              })
            }

            className="
              border
              rounded-xl
              p-3
              w-40
              flex-shrink-0
            "

            required={!militarSelecionado}
          >

            <option value="">

              Posto/Grad.

            </option>

            {postosGraduacoes.map(

            (posto) => (

              <option

                key={posto.id}

                value={posto.id}

              >

                {posto.sigla}

              </option>
            )
          )}

          </select>

          <input

            type="text"

            placeholder="Nome de Guerra"

            value={form.nomeGuerra}

            onChange={(e) =>

              setForm({

                ...form,

                nomeGuerra:
                  e.target.value.toUpperCase()
              })
            }

            className="
              border
              rounded-xl
              p-3
              flex-1
            "

            required={!militarSelecionado}
          />

        </div>

        <label

          className="
            mt-1
            flex
            items-center
            gap-2
            text-sm
          "

        >

          <input

            type="checkbox"

            checked={

              manterPG

            }

            onChange={(e) =>

              setManterPG(

                e.target.checked
              )
            }
          />

          Manter P/G para cadastro

        </label>

      </div>

      {/* SEGMENTO */}
      <div className="flex flex-col">

        <select
          value={form.segmento}
          onChange={(e) =>
            setForm({

              ...form,

              segmento:
                e.target.value
            })
          }
          className="
            border
            rounded-xl
            p-3
          "
        >

          <option value="">
            Segmento
          </option>

          <option value="M">
            MASCULINO
          </option>

          <option value="F">
            FEMININO
          </option>

        </select>

        <label
          className="
            flex 
            items-center 
            gap-2
            text-sm
          "
        >

          <input

            type="checkbox"

            checked={manterSegmento}

            onChange={(e) =>

              setManterSegmento(

                e.target.checked
              )
            }
          />

          manter Segmento para cadastro

        </label>
      </div>

      {/* CURSO */}
      <div className="flex flex-col">

      <select
        value={form.cursoId || ""}
        onChange={(e) =>
          setForm({

            ...form,

            cursoId:
              e.target.value
          })
        }
        className="
          border
          rounded-xl
          p-3
        "
      >

        <option value="">
          Curso
        </option>

        <option value="1">
          LEMB
        </option>

        <option value="2">
          LEMS/LEMC/LEMCT
        </option>

      </select>

      <label
         className="
           flex 
           items-center 
           gap-2
           text-sm
         "
       >

        <input

          type="checkbox"

          checked={manterCurso}

          onChange={(e) =>

            setManterCurso(

              e.target.checked
            )
          }
        />

        manter Curso para cadastro

      </label>
      </div>

      {/* DATA NASCIMENTO */}

      <input
        type="text"
        placeholder="Data de Nascimento"
        value={form.dataNascimento}
        onChange={(e) =>
          setForm({

            ...form,

            dataNascimento:
              formatarDataBR(
                e.target.value
              )
          })
        }
        className="
          border
          rounded-xl
          p-3
        "
        maxLength={10}
        required={!militarSelecionado}
      />

      {/* SUBUNIDADE */}
      <div className="space-y-2">

        <input
          type="text"

          placeholder="Subunidade"

          value={subunidadeInput}

          onChange={(e) => {

            let valor = e.target.value.toUpperCase();

            valor = valor.replace(

              /[^a-zA-ZÀ-ÿ0-9\s\-]/g,

              ""
            );

            valor = valor.replace(
              /\s{2,}/g,
              " "
            );

            setSubunidadeInput(
              valor
            );

            setForm({

              ...form,

              subunidade:
                valor
            });
          }}

          className="
            border
            rounded-xl
            p-3
            w-full
          "

          required={!militarSelecionado}
        />

        <label
          className="
            flex
            items-center
            gap-2
            text-sm
          "
        >

          <input
            type="checkbox"

            checked={
              manterSubunidade
            }

            onChange={(e) =>

              setManterSubunidade(
                e.target.checked
              )
            }
          />

          manter Subunidade para cadastro

        </label>

      </div>

      {/* BOTÃO */}

      <div className="col-span-2 grid grid-cols-[85%_14%] gap-3 mt-4">

  <button

    type="submit"

    className="
      bg-green-800
      hover:bg-green-700
      text-white
      font-semibold
      rounded-xl
      py-3
      w-full
    "
  >

    Cadastrar Militar

  </button>

  <button

    type="button"

    onClick={excluirMilitar}

    className="
      bg-red-600
      hover:bg-red-500
      text-white
      font-semibold
      rounded-xl
      py-3
      w-full
    "
  >

    Excluir

  </button>

</div>

      </form>

      </div>

      {/* CARD MILITAR */}

      {militarSelecionado && (

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-6">

            Militar

          </h2>

          <div
            className="
              border
              rounded-2xl
              p-6
              space-y-4
            "
          >

            <div>

              <p className="text-sm text-slate-500">
                Nome de Guerra
              </p>

              <p className="font-bold text-lg">

                {militarSelecionado.postoGraduacao?.abreviacao
    ?.replace("§", "º")}

                {" "}

                {militarSelecionado.nomeGuerra}

              </p>

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Nome Completo
              </p>

              <p className="font-bold">

                {militarSelecionado.nomeCompleto}

              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <p className="text-sm text-slate-500">
                  Segmento
                </p>

                <p className="font-bold">

                  {militarSelecionado.segmento === "M"
                    ? "MASCULINO"
                    : "FEMININO"
                  }

                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Curso
                </p>

                <p className="font-bold">

                  {militarSelecionado.curso?.codigo ===
                    "LEMS..."

                      ?

                      "LEMS/LEMC/LEMCT"

                      :

                      militarSelecionado.curso?.codigo || "-"
                  }

                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Data de Nascimento
                </p>

                <p className="font-bold">

                  {militarSelecionado
                    .dataNascimento

                    ?

                    new Date(
                      militarSelecionado
                        .dataNascimento
                    ).toLocaleDateString(
                      "pt-BR"
                    )

                    :

                    "-"
                  }

                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Subunidade
                </p>

                <p className="font-bold">

                  {militarSelecionado
                    .subunidade?.nome || "-"}

                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}