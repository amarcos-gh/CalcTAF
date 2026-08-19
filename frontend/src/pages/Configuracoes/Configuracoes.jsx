import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";

export default function Configuracoes() {
  const [aba, setAba] = useState("usuarios");

  const [usuarios, setUsuarios] = useState([]);
  const [oms, setOms] = useState([]);

  const [subunidades, setSubunidades] = useState([]);

  const [pesquisaUsuario, setPesquisaUsuario] = useState("");
  const [pesquisaOM, setPesquisaOM] = useState("");

  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalOM, setModalOM] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [omEditando, setOmEditando] = useState(null);

  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: null,
    status: "PENDENTE",
    omId: "",
    subunidade: ""
  });

  const [formOM, setFormOM] = useState({
    codom: "",
    sigla: "",
    cidade: "",
    uf: ""
  });

  const perfilLogado = localStorage.getItem("perfil");

  function limparTextoOM(valor) {

    let texto = valor.toUpperCase();

    // Remove caracteres não permitidos
    texto = texto.replace(
      /[^A-ZÁÀÂÃÄÉÊËÍÓÔÕÖÚÜÇ0-9ºª -]/g,
      ""
    );

    // Remove espaços duplos
    texto = texto.replace(
      / {2,}/g,
      " "
    );

    // Remove hífens repetidos
    texto = texto.replace(
      /-{2,}/g,
      "-"
    );

    return texto;
  }

  useEffect(() => {
    carregarUsuarios();
    carregarOMs();
  }, []);

  async function carregarUsuarios() {
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao carregar usuários.");
    }
  }

  async function carregarOMs() {
    try {
      const { data } = await api.get("/oms");
      setOms(data);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.error ||
          "Erro ao carregar Organizações Militares."
      );
    }
  }

  async function carregarSubunidades(omId) {

    console.log("=== CARREGAR SUBUNIDADES ===");
    console.log("OM ID RECEBIDO:", omId);

    if (!omId) {

      console.log("OM ID VAZIO!");

      setSubunidades([]);

      return;
    }

    try {

      const { data } = await api.get(
        `/subunidades?omId=${omId}`
      );

      console.log("SUBUNIDADES RECEBIDAS:", data);

      setSubunidades(data);

    } catch (error) {

      console.error("ERRO AO CARREGAR SUBUNIDADES:", error);
      console.error("RESPOSTA:", error.response?.data);

      setSubunidades([]);

    }
  }

  function novoUsuario() {
    setUsuarioEditando(null);

    setFormUsuario({
      nome: "",
      email: "",
      senha: "",
      perfil: "OPERADOR",
      omId: "",
      subunidade: ""
    });

    setModalUsuario(true);
  }

  async function editarUsuario(usuario) {

  console.log("=== EDITAR USUÁRIO ===");
  console.log("ID:", usuario.id);
  console.log("NOME:", usuario.nome);
  console.log("EMAIL:", usuario.email);
  console.log("PERFIL:", usuario.perfil);
  console.log("OM:", usuario.omId);
  console.log("SUBUNIDADE:", usuario.subunidade);

  setUsuarioEditando(usuario);

  const omId = usuario.omId
      ? String(usuario.omId)
      : "";

    setFormUsuario({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      perfil: usuario.perfil,
      status: usuario.status,
      omId,
      subunidade:
        usuario.perfil === "GERAL"
          ? ""
          : (usuario.subunidade || "")
    });

    if (omId && usuario.perfil !== "GERAL") {
      await carregarSubunidades(omId);
    } else {
      setSubunidades([]);
    }

    setModalUsuario(true);
  }

  function novaOM() {
    setOmEditando(null);

    setFormOM({
      codom: "",
      sigla: "",
      cidade: "",
      uf: ""
    });

    setModalOM(true);
  }

  function editarOM(om) {
    setOmEditando(om);

    setFormOM({
      codom: om.codom,
      sigla: om.sigla,
      cidade: om.cidade,
      uf: om.uf
    });

    setModalOM(true);
  }

  const usuariosFiltrados = useMemo(() => {

    const filtrados = usuarios.filter(
      (usuario) =>
        usuario.nome
          .toLowerCase()
          .includes(pesquisaUsuario.toLowerCase()) ||
        usuario.email
          .toLowerCase()
          .includes(pesquisaUsuario.toLowerCase())
    );

    return [...filtrados].sort((a, b) => {

      const nomeOMA =
        a.om?.sigla ||
        a.om?.nome ||
        "";

      const nomeOMB =
        b.om?.sigla ||
        b.om?.nome ||
        "";

      return nomeOMA.localeCompare(
        nomeOMB,
        "pt-BR",
        {
          sensitivity: "base"
        }
      );

    });

  }, [usuarios, pesquisaUsuario]);

  const omsFiltradas = useMemo(() => {
    return oms.filter(
      (om) =>
        om.codom
          .toLowerCase()
          .includes(pesquisaOM.toLowerCase()) ||
        om.sigla
          .toLowerCase()
          .includes(pesquisaOM.toLowerCase()) ||
        (om.cidade || "")
          .toLowerCase()
          .includes(pesquisaOM.toLowerCase()) ||
        (om.uf || "")
          .toLowerCase()
          .includes(pesquisaOM.toLowerCase())
    );
  }, [oms, pesquisaOM]);

  async function salvarUsuario() {
    try {
      const dados = {
        nome: formUsuario.nome,
        email: formUsuario.email,
        perfil: formUsuario.perfil,
        status: formUsuario.status,
        omId: Number(formUsuario.omId),
        subunidade: formUsuario.subunidade
      };

      if (formUsuario.senha.trim() !== "") {
        dados.senha = formUsuario.senha;
      }

      if (usuarioEditando) {
        await api.put(
          `/usuarios/${usuarioEditando.id}`,
          dados
        );
      } else {
        await api.post("/usuarios", {
          ...dados,
          senha: formUsuario.senha
        });
      }

      setModalUsuario(false);

      carregarUsuarios();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Erro ao salvar usuário."
      );

    }
  }

  async function excluirUsuario(id) {

    if (
      !window.confirm(
        "Deseja realmente excluir este usuário?"
      )
    ) {
      return;
    }

    try {

      await api.delete(`/usuarios/${id}`);

      carregarUsuarios();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Erro ao excluir usuário."
      );

    }
  }

  async function salvarOM() {

    try {

      if (!/^\d{6}$/.test(formOM.codom)) {

        alert(
          "O CODOM deve conter exatamente 6 números."
        );

        return;
      }

      if (omEditando) {

        await api.put(

          `/oms/${omEditando.id}`,

          formOM

        );

      } else {

        await api.post(

          "/oms",

          formOM

        );

      }

      setModalOM(false);

      carregarOMs();

    } catch (error) {

      console.error(error);

      alert(

        error.response?.data?.error ||

        "Erro ao salvar Organização Militar."

      );

    }

  }

  async function excluirOM(id) {

    if (
      !window.confirm(
        "Deseja realmente excluir esta Organização Militar?"
      )
    ) {
      return;
    }

    try {

      await api.delete(`/oms/${id}`);

      carregarOMs();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Erro ao excluir Organização Militar."
      );

    }

  }

   return (

  <div className="space-y-6">

    <div
      className="
        bg-white
        rounded-2xl
        shadow-lg
        p-5
      "
    >

      {/* ABAS */}

      <div
        className="
          flex
          justify-between
          items-center
          mb-5
          flex-wrap
          gap-3
        "
      >

        <div
          className="
            flex
            gap-2
          "
        >

          <button
            onClick={() => setAba("usuarios")}
            className={`
              px-5
              py-2
              rounded-lg
              font-semibold
              transition
              ${
                aba === "usuarios"
                  ? "bg-green-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }
            `}
          >
            Usuários
          </button>

          <button
            onClick={() => setAba("oms")}
            className={`
              px-5
              py-2
              rounded-lg
              font-semibold
              transition
              ${
                aba === "oms"
                  ? "bg-green-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }
            `}
          >
            Organizações Militares
          </button>

        </div>        

      </div>

      {/* NOVA OM */}

      {
        aba === "oms" &&
        perfilLogado === "GERAL" && (

          <div
            className="
              flex
              justify-end
              mb-3
            "
          >

            <button
  type="button"
  onClick={() => {

    setOmEditando(null);

    setFormOM({
      codom: "",
      sigla: "",
      cidade: "",
      uf: ""
    });

    setModalOM(true);

  }}
  className="
    px-5
    py-2
    bg-green-700
    hover:bg-green-800
    text-white
    rounded-lg
    font-semibold
    transition
  "
>
  NOVA OM
</button>

          </div>

        )
      }

      {/* PESQUISA */}

      <div className="mb-5">

        <input
          type="text"
          placeholder={
            aba === "usuarios"
              ? "Pesquisar usuário..."
              : "Pesquisar Organização Militar..."
          }
          value={
            aba === "usuarios"
              ? pesquisaUsuario
              : pesquisaOM
          }
          onChange={(e) =>

            aba === "usuarios"

              ? setPesquisaUsuario(e.target.value)

              : setPesquisaOM(e.target.value)

          }
          className="
            w-full
            border
            rounded-lg
            p-2
          "
        />

      </div>

      {/* TABELA */}

      <div
        className="
          bg-white
          rounded-2xl
          border
          overflow-auto
        "
      >

        {aba === "usuarios" ? (

          <table className="w-full">

            <thead>

              <tr className="border-b bg-slate-50">

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  Nome
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  E-mail
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  Perfil
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  Subunidade
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  Organização Militar
                </th>

                <th
                  className="
                    px-3
                    py-3
                    text-center
                    text-sm
                    font-semibold
                    w-44
                  "
                >
                  Ações
                </th>

              </tr>

            </thead>

            <tbody>

              {usuariosFiltrados.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="
                      p-6
                      text-center
                      text-slate-500
                    "
                  >
                    Nenhum usuário encontrado.
                  </td>

                </tr>

              ) : (

                usuariosFiltrados.map((usuario) => (

                  <tr
                    key={usuario.id}
                    className="
                      border-b
                      hover:bg-slate-50
                      text-sm
                    "
                  >

                    <td className="px-3 py-2">
                      {usuario.nome}
                    </td>

                    <td className="px-3 py-2">
                      {usuario.email}
                    </td>

                    <td className="px-3 py-2">

                      <span
                        className="
                          px-2
                          py-1
                          rounded-md
                          bg-slate-100
                          text-xs
                          font-semibold
                        "
                      >
                        {usuario.perfil}
                      </span>

                    </td>

                    <td className="px-3 py-2">
                      {
                        usuario.perfil === "GERAL"
                          ? "--"
                          : (usuario.subunidade || "-")
                      }
                    </td>

                    <td className="px-3 py-2">
                      {
                        usuario.perfil === "GERAL"
                          ? "--"
                          : (usuario.om?.sigla || "-")
                      }
                    </td>

                    <td
                      className="
                        px-3
                        py-2
                        text-center
                      "
                    >

                      <div
                        className="
                          flex
                          justify-center
                          gap-2
                        "
                      >

                      {
                        perfilLogado === "GERAL" ||
                        usuario.perfil !== "GERAL"

                          ? (

                            <>

                              <button
                                onClick={() =>
                                  editarUsuario(usuario)
                                }
                                className="
                                  px-3
                                  py-1
                                  rounded-lg
                                  bg-amber-500
                                  hover:bg-amber-600
                                  text-white
                                  text-xs
                                  font-semibold
                                "
                              >
                                Editar
                              </button>

                              <button
                                onClick={() =>
                                  excluirUsuario(usuario.id)
                                }
                                className="
                                  px-3
                                  py-1
                                  rounded-lg
                                  bg-red-600
                                  hover:bg-red-700
                                  text-white
                                  text-xs
                                  font-semibold
                                "
                              >
                                Excluir
                              </button>

                            </>

                          ) : (

                            <span
                              className="
                                inline-block
                                w-20
                                text-center
                                text-gray-400
                                text-sm
                                font-semibold
                              "
                            >
                              --
                            </span>

                          )
                      }

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        ) : (

          <table className="w-full">

            <thead>

              <tr className="border-b bg-slate-50">

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  CODOM
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  Sigla
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  Cidade
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold">
                  UF
                </th>

                <th
                  className="
                    px-3
                    py-3
                    text-center
                    text-sm
                    font-semibold
                    w-44
                  "
                >
                  Ações
                </th>

              </tr>

            </thead>

            <tbody>

              {omsFiltradas.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      p-6
                      text-center
                      text-slate-500
                    "
                  >
                    Nenhuma Organização Militar encontrada.
                  </td>

                </tr>

              ) : (

                omsFiltradas.map((om) => (

                <tr
                  key={om.id}
                  className="
                    border-b
                    hover:bg-slate-50
                    text-sm
                  "
                >

                  <td className="px-3 py-2">
                    {om.codom}
                  </td>

                  <td className="px-3 py-2">
                    {om.sigla}
                  </td>

                  <td className="px-3 py-2">
                    {om.cidade}
                  </td>

                  <td className="px-3 py-2">
                    {om.uf}
                  </td>

                  <td
                    className="
                      px-3
                      py-2
                      text-center
                    "
                  >

                    <div
                      className="
                        flex
                        justify-center
                        gap-2
                      "
                    >

                      <button
                        type="button"
                        onClick={() => {

                          if (perfilLogado !== "GERAL") {
                            return;
                          }

                          editarOM(om);

                        }}
                        disabled={perfilLogado !== "GERAL"}
                        title={
                          perfilLogado === "GERAL"
                            ? "Editar Organização Militar"
                            : "Acesso restrito ao GERAL"
                        }
                        className={`
                          px-3
                          py-1
                          rounded-lg
                          text-white
                          text-xs
                          font-semibold
                          ${
                            perfilLogado === "GERAL"
                              ? `
                                bg-amber-500
                                hover:bg-amber-600
                                cursor-pointer
                              `
                              : `
                                bg-amber-500
                                cursor-not-allowed
                              `
                          }
                        `}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => {

                          if (perfilLogado !== "GERAL") {
                            return;
                          }

                          excluirOM(om.id);

                        }}
                        disabled={perfilLogado !== "GERAL"}
                        title={
                          perfilLogado === "GERAL"
                            ? "Excluir Organização Militar"
                            : "Acesso restrito ao GERAL"
                        }
                        className={`
                          px-3
                          py-1
                          rounded-lg
                          text-white
                          text-xs
                          font-semibold
                          ${
                            perfilLogado === "GERAL"
                              ? `
                                bg-red-600
                                hover:bg-red-700
                                cursor-pointer
                              `
                              : `
                                bg-red-600
                                cursor-not-allowed
                              `
                          }
                        `}
                      >
                        Excluir
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

            </tbody>

          </table>

        )}

      </div>

    </div>

    {/* ===========================
        MODAL USUÁRIO
    =========================== */}

    {modalUsuario && (

      <div className="modal-overlay">

        <div
          className="
            bg-white
            rounded-2xl
            shadow-xl
            p-6
            w-full
            max-w-xl
          "
        >

          <h2 className="text-xl font-bold mb-5">

            {usuarioEditando

              ? "Editar Usuário"

              : "Novo Usuário"}

          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="block mb-1 font-semibold">
                Nome
              </label>

              <input
                type="text"
                value={formUsuario.nome}
                onChange={(e) => {

                  let valor = e.target.value.toUpperCase();

                  valor = valor.replace(
                    /[^A-ZÁÀÂÃÉÊÍÓÔÕÚÇ0-9ºª -]/g,
                    ""
                  );

                  valor = valor.replace(
                    / {2,}/g,
                    " "
                  );

                  valor = valor.replace(
                    /-{2,}/g,
                    "-"
                  );

                  setFormUsuario({
                    ...formUsuario,
                    nome: valor
                  });

                }}
                className="w-full border rounded-lg p-2"
              />

            </div>

            <div>

              <label className="block mb-1 font-semibold">
                E-mail
              </label>

              <input
                type="email"
                value={formUsuario.email}
                onChange={(e) =>
                  setFormUsuario({
                    ...formUsuario,
                    email: e.target.value.toUpperCase()
                  })
                }
                className="w-full border rounded-lg p-2"
              />

            </div>

            {!usuarioEditando && (

              <div>

                <label className="block mb-1 font-semibold">
                  Senha
                </label>

                <input
                  type="password"
                  value={formUsuario.senha}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      senha: e.target.value
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />

              </div>

            )}

            <div>

              <label className="block mb-1 font-semibold">
                Perfil
              </label>

              <select
                  value={formUsuario.perfil || ""}
                  onChange={(e) => {

                    const perfil = e.target.value;

                    setFormUsuario({

                      ...formUsuario,

                      perfil:
                        perfil || null,

                      subunidade:

                        perfil === "GERAL"

                          ? ""

                          : formUsuario.subunidade

                    });

                  }}

                  className="w-full border rounded-lg p-2"
                >

                  <option value="">
                    SEM PERFIL
                  </option>

                  <option value="ADMINISTRADOR">
                    ADMINISTRADOR
                  </option>

                  <option value="OPERADOR">
                    OPERADOR
                  </option>

                  <option value="AVALIADOR">
                    AVALIADOR
                  </option>

                </select>

              </div>

              <div>

              <label className="block mb-1 font-semibold">
                Status
              </label>

              <select
                value={formUsuario.status}
                onChange={(e) =>
                  setFormUsuario({
                    ...formUsuario,
                    status: e.target.value
                  })
                }
                className="w-full border rounded-lg p-2"
              >

                <option value="ATIVO">
                  ATIVO
                </option>

                <option value="PENDENTE">
                  PENDENTE
                </option>

                <option value="BLOQUEADO">
                  BLOQUEADO
                </option>

              </select>

            </div>

            <div className="md:col-span-2">

              <label className="block mb-1 font-semibold">
                Organização Militar
              </label>

              <select
                value={formUsuario.omId}
                
                onChange={(e) => {

                  const omId = e.target.value;

                  setFormUsuario({

                    ...formUsuario,

                    omId,

                    subunidade: ""

                  });

                  carregarSubunidades(omId);

                }}
                className="w-full border rounded-lg p-2"
              >

                <option value="">
                  Selecione...
                </option>

                {oms.map((om) => (

                  <option
                    key={om.id}
                    value={om.id}
                  >
                    {om.codom} - {om.sigla}
                  </option>

                ))}

              </select>

            </div>

            <div className="md:col-span-2">

              <label className="block mb-1 font-semibold">
                Subunidade
              </label>

              <select
                value={formUsuario.subunidade || ""}
                disabled={
                  !formUsuario.omId ||
                  formUsuario.perfil === "GERAL"
                }
                onChange={(e) =>
                  setFormUsuario({
                    ...formUsuario,
                    subunidade: e.target.value
                  })
                }
                className="w-full border rounded-lg p-2 disabled:bg-gray-100"
              >

              <option value="">

                {formUsuario.perfil === "GERAL"
                  ? "Não se aplica"
                  : "Selecione..."}

              </option>

              {subunidades.map((subunidade) => (

                <option
                  key={subunidade.id}
                  value={subunidade.nome}
                >
                  {subunidade.nome}
                </option>

              ))}

            </select>

            </div>

          </div>

          <div
            className="
              flex
              justify-end
              gap-3
              mt-6
            "
          >

            <button
              type="button"
              onClick={() =>
                setModalUsuario(false)
              }
              className="
                px-5
                py-2
                rounded-lg
                bg-slate-300
                hover:bg-slate-400
                font-semibold
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvarUsuario}
              className="
                px-5
                py-2
                rounded-lg
                bg-green-700
                hover:bg-green-800
                text-white
                font-semibold
              "
            >
              Salvar
            </button>

          </div>

        </div>

      </div>

    )}

    {/* ===========================
        MODAL OM
    =========================== */}

    {modalOM && (

      <div
        className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          bg-black/50
          p-4
        "
      >

        <div
          className="
            bg-white
            rounded-2xl
            shadow-xl
            p-6
            w-full
            max-w-lg
          "
        >

          <h2 className="text-xl font-bold mb-5">

            {omEditando

              ? "Editar Organização Militar"

              : "Nova Organização Militar"}

          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="block mb-1 font-semibold">
                CODOM
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={formOM.codom}
                onChange={(e) => {

                  const valor = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setFormOM({
                    ...formOM,
                    codom: valor
                  });

                }}
                className="w-full border rounded-lg p-2"
              />

            </div>

            <div>

              <label className="block mb-1 font-semibold">
                Sigla
              </label>

              <input
                type="text"
                value={formOM.sigla}
                onChange={(e) => {

                  let valor = e.target.value.toUpperCase();

                  valor = valor
                    .replace(/[^A-Z0-9À-Úºª -]/g, "")
                    .replace(/ {2,}/g, " ")
                    .replace(/-{2,}/g, "-");

                  valor = valor.replace(
                    /(?!\d)/g,
                    ""
                  );

                  setFormOM({
                    ...formOM,
                    sigla: valor
                  });

                }}
                className="w-full border rounded-lg p-2"
              />

            </div>

            <div>

              <label className="block mb-1 font-semibold">
                Cidade
              </label>

              <input
                type="text"
                value={formOM.cidade}
                onChange={(e) =>
                  setFormOM({
                    ...formOM,
                    cidade: limparTextoOM(e.target.value)
                  })
                }
                className="w-full border rounded-lg p-2"
              />

            </div>

            <div>

              <label className="block mb-1 font-semibold">
                UF
              </label>

              <input
                type="text"
                maxLength={2}
                value={formOM.uf}
                onChange={(e) => {

                  const valor = e.target.value
                    .toUpperCase()
                    .replace(
                      /[^A-ZÁÀÂÃÄÉÊËÍÓÔÕÖÚÜÇ]/g,
                      ""
                    )
                    .slice(0, 2);

                  setFormOM({
                    ...formOM,
                    uf: valor
                  });

                }}
                className="w-full border rounded-lg p-2"
              />

            </div>

          </div>

          <div
            className="
              flex
              justify-end
              gap-3
              mt-6
            "
          >

            <button
              type="button"
              onClick={() =>
                setModalOM(false)
              }
              className="
                px-5
                py-2
                rounded-lg
                bg-slate-300
                hover:bg-slate-400
                font-semibold
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvarOM}
              className="
                px-5
                py-2
                rounded-lg
                bg-green-700
                hover:bg-green-800
                text-white
                font-semibold
              "
            >
              Salvar
            </button>

          </div>

        </div>

      </div>

    )}

  </div>

  );
}