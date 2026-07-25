import { useEffect, useState } from "react";

import api from "../../services/api";

import mencaoColor from "../../utils/mencaoColor";

export default function Avaliacoes() {

  const [militares, setMilitares] = useState([]);

  const [avaliacoes, setAvaliacoes] = useState([]);

  const [campanhas, setCampanhas] = useState([]);

  const [mensagem, setMensagem] = useState("");

  const [busca, setBusca] = useState("");

  const [buscaMilitar, setBuscaMilitar] = useState("");

  const [militarSelecionado, setMilitarSelecionado] = useState(null);

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);

  const [manterPeriodo, setManterPeriodo] = useState(false);

  const [form, setForm] = useState({

    militarId: "",

    campanhaId: "",
    chamadaId: "",

    periodoInicio: "",
    periodoFim: "",

    corrida: "",
    flexao: "",
    abdominal: "",
    barra: "",

    ppm: ""
  });

  const cursoEspecial =

    ["LEMS", "LEMC", "LEMCT"]

      .includes(

        militarSelecionado?.curso?.codigo
      );

  const idadeMilitar =

    militarSelecionado

      ?

      new Date().getFullYear()

        -

      new Date(

          militarSelecionado.dataNascimento

        ).getFullYear()

      :

      0;

  const militar50Mais =

    idadeMilitar >= 50;

  const dispensaBarra =

    cursoEspecial

    ||

    idadeMilitar >= 50;

  const dispensaPPM =

    cursoEspecial

    ||

    idadeMilitar >= 40;

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

        console.error(error);
      }
    }

  async function carregarAvaliacoes() {

    try {

      const response =

    await api.get(

    `/avaliacoes?omId=${

    localStorage.getItem(

    "omId"

    )

  }`
);

console.table(

  response.data.map(

    (a) => ({

      id:
        a.id,

      militar:
        a.militar
          ?.nomeGuerra,

      militarId:
        a.militarId,

      chamada:
        a.chamadaId,

      mencao:
        a.mencaoFinal
    })
  )
);

const unicas =

  Object.values(

    response.data.reduce(

      (

        acc,

        atual

      ) => {

        const chave =

          `${

            atual.militarId

          }-${

            atual.chamada?.campanhaId

          }`;

        if (

          !acc[chave]

          ||

          atual.id >

          acc[chave].id

        ) {

          acc[chave] =

            atual;
        }

        return acc;

      },

      {}
    )
  );

setAvaliacoes(

  unicas
);

    } catch (error) {

      console.error(error);
    }
  }

  async function carregarCampanhas() {

    try {

      const response =
        await api.get("/campanhas");

      setCampanhas(response.data);

    } catch (error) {

      console.error(error);
    }
  }

  async function cadastrarAvaliacao(e) {

  e.preventDefault();

  try {

    const response =

      await api.post(

        "/avaliacoes",

        {

          militarId:

            Number(
              form.militarId
            ),

          chamadaId:

            Number(
              form.chamadaId
            ),

          corrida:

            Number(
              form.corrida
            ),

          flexao:

            Number(
              form.flexao
            ),

          abdominal:

            Number(
              form.abdominal
            ),

          barra:

            Number(
              form.barra
            ),

          ppm:

            form.ppm,

          periodoInicio:

            form.periodoInicio,

          periodoFim:

            form.periodoFim,

          omId:

            Number(
              localStorage.getItem(
                "omId"
              )
            )
        }
      );

      setMensagem("");

      setForm({

        militarId: "",

        periodoInicio:

          manterPeriodo

            ? form.periodoInicio

            : "",

        periodoFim:

          manterPeriodo

            ? form.periodoFim

            : "",

        campanhaId:

          manterPeriodo

            ? form.campanhaId

            : "",

        chamadaId:

          manterPeriodo

            ? form.chamadaId

            : "",

        corrida: "",
        flexao: "",
        abdominal: "",
        barra: "",
        ppm: ""

      });

      setBuscaMilitar("");

      setAvaliacaoSelecionada(response.data);

      carregarAvaliacoes();

    } catch (error) {

      console.error(error);

      if (
        error.response?.status === 409
      ) {

        const avaliacaoExistente =
          error.response.data.avaliacao;

        setAvaliacaoSelecionada({

          ...avaliacaoExistente,

          corrida:

            form.corrida ||

            avaliacaoExistente.corrida,

          flexao:

            form.flexao ||

            avaliacaoExistente.flexao,

          abdominal:

            form.abdominal ||

            avaliacaoExistente.abdominal,

          barra:

            dispensaBarra

              ?

              ""

              :

              (

                form.barra ||

                avaliacaoExistente.barra
              ),

          ppm:

            dispensaPPM

              ?

              ""

              :

              (

                form.ppm ||

                avaliacaoExistente.ppm
              )
        });

        const confirmar =
        window.confirm(

          "Já existe avaliação deste militar nesta chamada.\n\nDeseja atualizar?"
        );

      if (confirmar) {

        try {

          const response =
          await api.put(

            `/avaliacoes/${avaliacaoExistente.id}`,

            {

              corrida:

                form.corrida !== ""

                  ? Number(form.corrida)

                  : avaliacaoExistente.corrida,

              flexao:

                form.flexao !== ""

                  ? Number(form.flexao)

                  : avaliacaoExistente.flexao,

              abdominal:

                form.abdominal !== ""

                  ? Number(form.abdominal)

                  : avaliacaoExistente.abdominal,

              barra:

                form.barra !== ""

                  ? Number(form.barra)

                  : avaliacaoExistente.barra,

              ppm:

                form.ppm !== ""

                  ? form.ppm

                  : avaliacaoExistente.ppm,

              periodoInicio:

                form.periodoInicio,

              periodoFim:

                form.periodoFim

            }
          );

          setAvaliacaoSelecionada(
            response.data
          );

          setMensagem(
            "Avaliação atualizada com sucesso."
          );

        } catch (error) {

          console.error(error);

          setMensagem(
            "Erro ao atualizar avaliação."
          );
        }

      } else {

        setAvaliacaoSelecionada(
          null
        );
      }

      return;
      }

      if (

        error.response?.status === 409

      ) {

        setMensagem(

          "Avaliação já existente para esta chamada."
        );

      } else if (

        error.response?.data?.error

      ) {

        setMensagem(

          error.response.data.error
        );

      } else {

        setMensagem(

          "Erro ao lançar avaliação."
        );
      }
    }
  }

  useEffect(() => {

    carregarMilitares();

    carregarAvaliacoes();

    carregarCampanhas();

  }, []);

  useEffect(() => {

    return () => {

      setManterPeriodo(
        false
      );
    };

  }, []);

  const avaliacoesFiltradas =
    avaliacoes.filter((avaliacao) => {

      if (!busca.trim()) {
        return true;
      }

      const termo =
        busca.toLowerCase();

      const nomeGuerra =
        avaliacao.militar?.nomeGuerra
          ?.toLowerCase() || "";

      const nomeCompleto =
        avaliacao.militar?.nomeCompleto
          ?.toLowerCase() || "";

      return (
        nomeGuerra.includes(termo) ||
        nomeCompleto.includes(termo)
      );
    });

  const militaresFiltrados =
    militares.filter((militar) => {

      if (!buscaMilitar.trim()) {
        return false;
      }

      const termo =
        buscaMilitar.toLowerCase();

      const nomeGuerra =
        militar.nomeGuerra
          ?.toLowerCase() || "";

      const nomeCompleto =
        militar.nomeCompleto
          ?.toLowerCase() || "";

      return (
        nomeGuerra.includes(termo) ||
        nomeCompleto.includes(termo)
      );
    });

      console.log(

        "CAMPANHAS:",

        campanhas
      );

return (

    <div className="space-y-6">

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div
  className="
    grid
    grid-cols-12
    gap-4
    mb-4
    items-center
  "
>

  {/* TÍTULO */}

  <div
    className="
      col-span-3
    "
  >

    <h2
      className="
        text-2xl
        font-bold
      "
    >

      Lançamento TAF

    </h2>

  </div>

  {/* PERÍODO */}

  <div
    className="
      col-span-9
      grid
      grid-cols-12
      gap-4
      items-center
    "
  >

    <div
      className="
        col-span-4
      "
    >

      <input
        type="date"

        value={
          form.periodoInicio || ""
        }

        onChange={(e) =>

          setForm({

            ...form,

            periodoInicio:
              e.target.value
          })
        }

        className="
          border
          rounded-xl
          p-3
          w-full
        "
      />

    </div>

    <div
      className="
        col-span-4
      "
    >

      <input
        type="date"

        value={
          form.periodoFim || ""
        }

        onChange={(e) =>

          setForm({

            ...form,

            periodoFim:
              e.target.value
          })
        }

        className="
          border
          rounded-xl
          p-3
          w-full
        "
      />

    </div>

    <div
      className="
        col-span-4
      "
    >

      <label
        className="
          flex
          items-center
          gap-2
          whitespace-nowrap
        "
      >

        <input
          type="checkbox"

          checked={
            manterPeriodo
          }

          onChange={(e) =>

            setManterPeriodo(
              e.target.checked
            )
          }
        />

        Manter Período após Lançamento

      </label>

    </div>

  </div>

</div>

        {mensagem && (

          <div
            className="
              bg-red-100
              border
              border-red-400
              text-red-700
              px-4
              py-3
              rounded-xl
              mb-4
            "
          >

            {mensagem}

          </div>
        )}

        <form
          onSubmit={cadastrarAvaliacao}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <select
            value={form.campanhaId}
            onChange={(e) =>
              setForm({
                ...form,
                campanhaId: e.target.value,
                chamadaId: ""
              })
            }
            className="border rounded-xl p-3"
            required
          >

            <option value="">
              Selecione o Teste
            </option>

            {campanhas.map((teste) => (

              <option
                key={teste.id}
                value={teste.id}
              >

                {teste.numeroTAF}º TAF - {teste.ano}

              </option>
            ))}

          </select>

          <select
            value={form.chamadaId}
            onChange={(e) =>
              setForm({
                ...form,
                chamadaId: e.target.value
              })
            }
            className="border rounded-xl p-3"
            required
          >

            <option value="">
              Selecione a Chamada
            </option>

            {(campanhas.find(
              (teste) =>
                String(teste.id) ===
                String(form.campanhaId)
            )?.chamadas || []).map((chamada) => (

              <option
                key={chamada.id}
                value={chamada.id}
              >

                {chamada.numeroChamada}ª Chamada

              </option>
            ))}

          </select>

          <div className="relative">

            <input
              type="text"

              placeholder="Buscar Militar..."

              value={buscaMilitar}

              onChange={(e) => {

                setMilitarSelecionado(
                  null
                );

                setBuscaMilitar(
                  e.target.value
                );

                setForm({

                  ...form,

                  militarId: ""
                });
              }}

              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />

              {

                buscaMilitar

                &&

                !militarSelecionado

                &&

                militaresFiltrados.length > 0

                && (

                  <div
                    className="
                      absolute
                      top-full
                      left-0
                      right-0
                      mt-1
                      bg-white
                      border
                      rounded-xl
                      shadow-xl
                      z-50
                      max-h-60
                      overflow-y-auto
                    "
                  >

                    {

                      militaresFiltrados.map((militar) => (

                        <button
                          key={militar.id}
                          type="button"
                          onClick={async () => {

                          setForm({

                            ...form,

                            militarId:
                              militar.id
                          });

                          setMilitarSelecionado(

                            militar
                          );

                          setBuscaMilitar(

                            `${militar.postoGraduacao.abreviacao?.replace("§", "º")} ${militar.nomeGuerra}`
                          );

                            try {

                              const response =

                                await api.get(

                                  `/avaliacoes?omId=${

                                    localStorage.getItem(

                                      "omId"
                                    )

                                  }`
                                );

                              const avaliacaoExistente =

                                response.data.find((avaliacao) => {

                                  return (

                                    avaliacao.militarId ===

                                      militar.id

                                    &&

                                    avaliacao.chamadaId ===

                                      Number(

                                        form.chamadaId
                                      )
                                  );
                                });

                              if (

                                avaliacaoExistente

                              ) {

                                setAvaliacaoSelecionada({

                                  ...avaliacaoExistente,

                                  corrida:

                                    form.corrida ||

                                    avaliacaoExistente.corrida,

                                  flexao:

                                    form.flexao ||

                                    avaliacaoExistente.flexao,

                                  abdominal:

                                    form.abdominal ||

                                    avaliacaoExistente.abdominal,

                                  barra:

                                    form.barra ||

                                    avaliacaoExistente.barra,

                                  ppm:

                                    form.ppm ||

                                    avaliacaoExistente.ppm
                                });

                              }

                            } catch (

                              error

                            ) {

                              console.error(

                                error
                              );
                            }
                          }}

                          className="
                            w-full
                            text-left
                            p-3
                            hover:bg-slate-100
                            border-b
                          "
                        >

                          <p className="font-bold">

                            {militar.postoGraduacao?.abreviacao?.replaceAll("§", "º")}

                            {" "}

                            {militar.nomeGuerra}

                          </p>

                          <p className="text-sm text-slate-500">

                            {militar.nomeCompleto}

                          </p>

                        </button>
                      ))
                    }

                  </div>
              )
              }

          </div>

          <input
            type="number"
            placeholder="Corrida"
            value={form.corrida}
            onChange={(e) =>
              setForm({
                ...form,
                corrida: e.target.value
              })
            }
            className="border rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Flexão"
            value={form.flexao}
            onChange={(e) =>
              setForm({
                ...form,
                flexao: e.target.value
              })
            }
            className="border rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Abdominal"
            value={form.abdominal}
            onChange={(e) =>
              setForm({
                ...form,
                abdominal: e.target.value
              })
            }
            className="border rounded-xl p-3"
          />

          <input
            type="number"

            placeholder={

              dispensaBarra

                ?

                "Não se aplica"

                :

                "Barra"
            }

            value={

              dispensaBarra

                ?

                ""

                :

                form.barra
            }

            disabled={

              dispensaBarra
            }

            onChange={(e) =>

              setForm({

                ...form,

                barra:

                  e.target.value
              })
            }

            className={`

              border

              rounded-xl

              p-3

              ${

                dispensaBarra

                  ?

                  "bg-gray-100 text-gray-500 cursor-not-allowed"

                  :

                  ""
              }
            `}
          />

          <select

            value={

              dispensaPPM

                ?

                ""

                :

                form.ppm
            }

            onChange={(e) =>

              setForm({

                ...form,

                ppm:

                  e.target.value
              })
            }

            disabled={

              dispensaPPM
            }

            className={`

              border

              rounded-xl

              p-3

              ${

                dispensaPPM

                  ?

                  "bg-gray-100 text-gray-500 cursor-not-allowed"

                  :

                  ""
              }
            `}

            required={

              !dispensaPPM
            }
          >

            {

              dispensaPPM

                ?

                (

                  <option value="">
                    Não se aplica
                  </option>

                )

                :

                <>

                  <option value="PPM">
                    PPM
                  </option>

                  <option value="A">
                    APTO
                  </option>

                  <option value="NA">
                    NÃO APTO
                  </option>

                </>

            }

          </select>

          <button
            type="submit"
            className="
              bg-green-800
              hover:bg-green-900
              text-white
              rounded-xl
              p-3
              font-bold
              md:col-span-2
              w-full
            "
          >

            Lançar Avaliação

          </button>

        </form>

      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold mb-4">
            Avaliações
          </h2>

        </div>

        <div className="space-y-4">

          {avaliacaoSelecionada && (

            <div
              className="
                border
                rounded-2xl
                p-6
                bg-white
                shadow-sm
              "
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>

                  <p className="text-sm text-slate-500">
                    Nº do Teste
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.chamada
                      ?.campanha
                      ?.numeroTAF}º TAF

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Nº da Chamada
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.chamada
                      ?.numeroChamada}ª Chamada

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Nome de Guerra
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.militar
                      ?.postoGraduacao
                      ?.abreviacao}

                    {" "}

                    {avaliacaoSelecionada
                      ?.militar
                      ?.nomeGuerra}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Nome Completo
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.militar
                      ?.nomeCompleto}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Corrida
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.corrida}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Flexão
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.flexao}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Abdominal
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.abdominal}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Barra
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.barra}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    PPM
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.ppm}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Menção Final
                  </p>

                  <p className="font-bold text-lg">

                    {avaliacaoSelecionada
                      ?.mencaoFinal || "NR"}

                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}