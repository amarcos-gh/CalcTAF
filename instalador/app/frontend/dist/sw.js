const CACHE_NAME = "calctaf-campo-v1";

self.addEventListener("fetch", (event) => {

  if (event.request.url.includes(":3000")) {

    return;

  }

  event.respondWith(

    caches.match(event.request)

      .then((response) => {

        if (response) {

          return response;

        }

        return fetch(event.request);

      })

      .catch(() => {

        return fetch(event.request);

      })

  );

});

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys().then((cacheNames) =>

      Promise.all(

        cacheNames.map((cacheName) => {

          if (cacheName !== CACHE_NAME) {

            return caches.delete(cacheName);

          }

        })

      )

    )

  );

});