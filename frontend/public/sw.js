const CACHE_NAME = "calctaf-campo-v4";

const BASE_URL =
  self.registration.scope;

const APP_SHELL = [
  BASE_URL,
  `${BASE_URL}index.html`,
  `${BASE_URL}manifest.webmanifest`,
  `${BASE_URL}icon/logo_192.png`,
  `${BASE_URL}icon/logo_512.png`
];

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

  event.respondWith(

    caches.match(request)

      .then((cachedResponse) => {

        if (cachedResponse) {

          return cachedResponse;

        }

        return fetch(request)

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

          .catch(() => {

            if (
              request.mode === "navigate"
            ) {

              return caches.match(
                BASE_URL
              );

            }

            return new Response(
              "",
              {
                status: 503,
                statusText: "Offline"
              }
            );

          });

      })

  );

});