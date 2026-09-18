const CACHE_NAME = "calctaf-campo-v6";

const BASE_URL =
  self.registration.scope;

const APP_SHELL = [
  `${BASE_URL}coleta`,
  `${BASE_URL}`,
  `${BASE_URL}index.html`,
  `${BASE_URL}manifest.webmanifest`,
  `${BASE_URL}icon/logo_192.png`,
  `${BASE_URL}icon/logo_512.png`
];


// ======================================================
// INSTALAÇÃO
// ======================================================

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then((cache) =>
        cache.addAll(APP_SHELL)
      )

      .then(() =>
        self.skipWaiting()
      )

  );

});


// ======================================================
// ATIVAÇÃO
// ======================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()

      .then((cacheNames) =>

        Promise.all(

          cacheNames.map((cacheName) => {

            if (
              cacheName !== CACHE_NAME
            ) {

              return caches.delete(
                cacheName
              );

            }

            return null;

          })

        )

      )

      .then(() =>
        self.clients.claim()
      )

  );

});


// ======================================================
// FETCH
// ======================================================

self.addEventListener("fetch", (event) => {

  const request =
    event.request;

  if (
    request.method !== "GET"
  ) {

    return;

  }

  const url =
    new URL(request.url);

  if (
    url.origin !==
    self.location.origin
  ) {

    return;

  }


  // ====================================================
  // NAVEGAÇÃO DO CALCTAF CAMPO
  // ====================================================

  if (
    request.mode === "navigate" &&
    url.pathname.startsWith("/coleta")
  ) {

    event.respondWith(

      fetch(request, {
        cache: "no-store"
      })

        .then((response) => {

          /*
           * Se o servidor responder 401/403
           * para uma rota como /coleta/login,
           * entregamos o App Shell /coleta.
           */

          if (
            response.status === 401 ||
            response.status === 403
          ) {

            return caches.match(
              `${BASE_URL}coleta`
            );

          }

          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {

            const responseClone =
              response.clone();

            caches.open(
              CACHE_NAME
            )
              .then((cache) => {

                cache.put(
                  `${BASE_URL}coleta`,
                  responseClone
                );

              });

          }

          return response;

        })

        .catch(() =>

          caches.match(
            `${BASE_URL}coleta`
          )

        )

    );

    return;

  }


  // ====================================================
  // ARQUIVOS ESTÁTICOS DO APLICATIVO
  // ====================================================

  const ehArquivoEstatico =

    url.pathname.startsWith("/assets/") ||

    url.pathname.startsWith("/icon/") ||

    url.pathname.endsWith(
      "manifest.webmanifest"
    );


  if (!ehArquivoEstatico) {

    return;

  }


  // ====================================================
  // REDE PRIMEIRO
  // ====================================================

  event.respondWith(

    fetch(request)

      .then((response) => {

        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {

          const responseClone =
            response.clone();

          caches.open(
            CACHE_NAME
          )
            .then((cache) => {

              cache.put(
                request,
                responseClone
              );

            });

        }

        return response;

      })

      .catch(() =>

        caches.match(request)

          .then((cachedResponse) => {

            if (cachedResponse) {

              return cachedResponse;

            }

            return new Response(
              "",
              {
                status: 503,
                statusText: "Offline"
              }
            );

          })

      )

  );

});