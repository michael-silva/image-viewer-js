

import { of } from './observable';

export const loadImage = (src) => {
  const progress$ = of({ loaded: 0, total: 0 });

  fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw Error(`${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw Error('ReadableStream not yet supported in this browser.');
      }

      const contentLength = response.headers.get('content-length');
      if (!contentLength) {
        throw Error('Content-Length response header unavailable');
      }

      const total = parseInt(contentLength);
      let loaded = 0;

      return new Response(
        new ReadableStream({
          start(controller) {
            const reader = response.body.getReader();

            const read = () => {
              reader.read()
                .then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  loaded += value.byteLength;
                  progress$.next({ loaded, total });
                  controller.enqueue(value);
                  read();
                })
                .catch((error) => {
                  console.error(error);
                  controller.error(error);
                });
            };

            read();
          },
        }),
      );
    })
    .then((response) => response.blob())
    .then((data) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        progress$.next({ loaded: data.size, total: data.size, data: reader.result });
      }, false);
      reader.readAsDataURL(data);
    })
    .catch((error) => {
      console.error(error);
      progress$.error(error);
    });

  return progress$;
};
