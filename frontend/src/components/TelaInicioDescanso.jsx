import { useEffect, useRef, useState } from "react";
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

  const rotaAnteriorRef = useRef(location.pathname);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (estaNoLogin || !token) {
      setMostrarTela(false);

      sessionStorage.removeItem("telaInicioExibida");

      rotaAnteriorRef.current = location.pathname;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      return;
    }

    const estavaNoLogin =
      rotaAnteriorRef.current === "/" ||
      rotaAnteriorRef.current === "/recuperar-senha" ||
      rotaAnteriorRef.current === "/cadastro-usuario" ||
      rotaAnteriorRef.current === "/coleta/login";

    const telaJaExibida =
      sessionStorage.getItem("telaInicioExibida") === "true";

    if (estavaNoLogin && !telaJaExibida) {
      setMostrarTela(true);
      sessionStorage.setItem("telaInicioExibida", "true");
    }

    rotaAnteriorRef.current = location.pathname;
  }, [location.pathname, estaNoLogin]);

  useEffect(() => {
    if (estaNoLogin) {
      return;
    }

    if (!localStorage.getItem("token")) {
      return;
    }

    function iniciarContagem() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      eventos.forEach((evento) => {
        window.removeEventListener(
          evento,
          atividadeUsuario
        );
      });
    };
  }, [estaNoLogin, mostrarTela]);

  function fecharTela() {
    setMostrarTela(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(() => {
      setMostrarTela(true);
    }, 5 * 60 * 1000);
  }

  return (
    <div className="min-h-screen">

      {children}

      {mostrarTela && (
        <div
          onClick={fecharTela}
          className="
            fixed
            inset-0
            z-[99999]
            flex
            items-center
            justify-center
            bg-white
            cursor-pointer
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
              select-none
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
          </div>
        </div>
      )}

    </div>
  );
}