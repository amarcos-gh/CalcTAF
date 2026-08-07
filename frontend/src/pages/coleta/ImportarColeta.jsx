import { useRef } from "react";

export default function ImportarColeta({

  onImportado,

  textoBotao = "📥 IMPORTAR COLETA"

}) {

  const inputRef = useRef(null);

  function selecionarArquivo() {

    inputRef.current?.click();

  }

  async function importar(event) {

    const arquivo = event.target.files?.[0];

    if (!arquivo) {

      return;

    }

    try {

      const texto = await arquivo.text();

      const dados = JSON.parse(texto);

console.log("ARQUIVO CTAF:", dados);

      // =====================================
      // VALIDAÇÕES
      // =====================================

      if (!dados || typeof dados !== "object") {

        throw new Error("Arquivo inválido.");

      }

      if (dados.tipo !== "CALCTAF_COLETA") {

        throw new Error(
          "O arquivo selecionado não é uma coleta do CalcTAF."
        );

      }

      if (!dados.versao) {

        throw new Error(
          "Versão da coleta não informada."
        );

      }

      if (!dados.om) {

        throw new Error(
          "Organização Militar não encontrada."
        );

      }

      if (!dados.subunidade && !dados.su) {

        throw new Error(
          "Subunidade não encontrada."
        );

      }

      if (!dados.avaliador) {

        throw new Error(
          "Avaliador não encontrado."
        );

      }

      if (

        !dados.avaliador.email

      ) {

        throw new Error(

          "E-mail do avaliador não encontrado."

        );

      }

      if (

        !dados.chamada?.codigoAutenticacaoHash

      ) {

        throw new Error(

          "Código de autenticação da coleta não encontrado."

        );

      }

      if (!Array.isArray(dados.militares)) {

        throw new Error(
          "Lista de militares inválida."
        );

      }

      if (dados.militares.length === 0) {

        throw new Error(
          "A coleta não possui militares."
        );

      }

      // =====================================
      // ENTREGA A COLETA PARA O LOGIN
      // =====================================

      event.target.value = "";

      if (onImportado) {

        await onImportado(dados);

      }

    }

    catch (erro) {

      console.error(erro);

      alert(

        erro.message ||

        "Erro ao ler o arquivo da coleta."

      );

      event.target.value = "";

    }

  }

  return (

    <>

      <button

        onClick={selecionarArquivo}

        className="

          w-full

          bg-green-900

          hover:bg-green-800

          transition

          text-white

          rounded-xl

          py-4

          font-semibold

        "

      >

        {textoBotao}

      </button>

      <input

        ref={inputRef}

        type="file"

        accept=".ctaf,.json"

        hidden

        onChange={importar}

      />

    </>

  );

}