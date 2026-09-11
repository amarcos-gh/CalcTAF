import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function TelaInicioDescanso({ children }) {
  const location = useLocation();

  const estaNoLogin =
    location.pathname === "/" ||
    location.pathname === "/recuperar-senha" ||
    location.pathname === "/cadastro-usuario" ||
    location.pathname === "/coleta/login";

  const [mostrarTela, setMostrarTela] = useState(false);

  useEffect(() => {
    if (estaNoLogin) {
      setMostrarTela(false);
      return;
    }

    if (!localStorage.getItem("token")) {
      setMostrarTela(false);
      return;
    }

    setMostrarTela(true);
  }, [location.pathname, estaNoLogin]);

  useEffect(() => {
    if (estaNoLogin) {
      return;
    }

    if (!localStorage.getItem("token")) {
      return;
    }

    let timer;

    function iniciarContagem() {
      clearTimeout(timer);

      timer = setTimeout(() => {
        setMostrarTela(true);
      }, 5 * 60 * 1000);
    }

    function atividadeUsuario() {
      if (mostrarTela) {
        return;
      }

      iniciarContagem();
    }

    const eventos = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click"
    ];

    eventos.forEach((evento) => {
      window.addEventListener(
        evento,
        atividadeUsuario,
        { passive: true }
      );
    });

    iniciarContagem();

    return () => {
      clearTimeout(timer);

      eventos.forEach((evento) => {
        window.removeEventListener(
          evento,
          atividadeUsuario
        );
      });
    };
  }, [estaNoLogin, mostrarTela]);

  function entrarNoSistema() {
    setMostrarTela(false);
  }

  return (
    <div className="min-h-screen">

      {children}

      {mostrarTela && (
        <div
          className="
            fixed
            inset-0
            z-[99999]
            flex
            items-center
            justify-center
            bg-white
          "
        >

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
              w-full
              h-full
            "
          >

            <img
              src={logo}
              alt="CalcTAF"
              className="
                w-52
                max-w-[65vw]
                object-contain
                mb-8
              "
            />

            <h1
              className="
                text-2xl
                md:text-4xl
                font-bold
                text-green-800
                uppercase
              "
            >
              SEJA BEM-VINDO E BOM TRABALHO!!!
            </h1>

            <button
              type="button"
              onClick={entrarNoSistema}
              className="
                mt-10
                bg-green-800
                hover:bg-green-700
                text-white
                font-semibold
                rounded-xl
                px-10
                py-3
                shadow-lg
              "
            >
              ENTRAR
            </button>

          </div>

        </div>
      )}

    </div>
  );
}