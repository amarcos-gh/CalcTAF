import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    const caminhoAtual = window.location.pathname;

    const estaNoCampo =
      caminhoAtual === "/coleta" ||
      caminhoAtual.startsWith("/coleta/");

    const registros =
      await navigator.serviceWorker.getRegistrations();

    /*
     * O Service Worker do CalcTAF Campo deve controlar
     * somente /coleta.
     *
     * Remove registros antigos que estejam controlando
     * a raiz do sistema (CalcTAF Web).
     */

    for (const registro of registros) {

      const escopo =
        new URL(
          registro.scope
        ).pathname;

      if (
        !estaNoCampo ||
        escopo === "/"
      ) {

        await registro.unregister();

      }

    }

    /*
     * Registra o Service Worker somente quando
     * o usuário estiver no CalcTAF Campo.
     */

    if (estaNoCampo) {

      await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}sw.js`,
        {
          scope: "/coleta"
        }
      );

    }

  });

}