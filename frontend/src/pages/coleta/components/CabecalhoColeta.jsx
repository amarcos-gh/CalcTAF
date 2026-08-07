import logo from "../../../assets/logo.png";

export default function CabecalhoColeta({

  siglaOM = "OM",

  subunidade = "",

  titulo = "CalcTAF Campo"

}) {

  return (

    <div className="flex flex-col items-center mb-6">

      <img
        src={logo}
        alt="CalcTAF"
        className="w-20 h-20"
      />

      <h1 className="mt-3 text-2xl font-bold text-green-900">

        {titulo}

      </h1>

      <p
        className="
          mt-2
          text-base
          font-semibold
          text-gray-700
          text-center
        "
      >

        {siglaOM}

      </p>

      {subunidade && (

      <p
        className="
          mt-1
          text-sm
          text-gray-500
          text-center
        "
      >

        {
          typeof subunidade === "object"
            ? subunidade.nome
            : subunidade
        }

      </p>

    )}

    </div>

  );

}