import { html, renderToStream } from '../index.js';
import http from 'http';

http
  .createServer((req, res) => {
    const data = {
      title: new Date().toISOString(),
      isTrue: Math.random() > 0.5,
      number: Math.random() * 100,
    };
    res.writeHead(200);
    const stream = renderToStream(template(data));
    stream.pipe(res);
  })
  .listen(3000);

function template(data) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${data.title}</title>
      </head>

      <body>
        <header><h1 ?negative="${data.isTrue}">${data.title}</h1></header>
        <main>
          <ol>
            ${Array.from({ length: Math.random() * 50 }).map(
              (v, i) => html`
                <li>
                  ${i} - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc molestie lacus eget ipsum
                  pellentesque, quis ullamcorper enim semper
                </li>
              `,
            )}
          </ol>
          <p>
            Duis eleifend nec lectus a ${data.number}. Suspendisse placerat mollis porta. Pellentesque nec quam non
            sapien facilisis ultricies quis nec risus. Quisque feugiat dui quis lectus iaculis, molestie pretium augue
            tincidunt. Suspendisse potenti. Pellentesque habitant morbi tristique senectus et netus et malesuada fames
            ac turpis egestas. Suspendisse quis libero sagittis, vulputate magna in, laoreet sem. Ut elementum nunc eget
            libero hendrerit eleifend at eget sem. Sed vel urna consequat, interdum massa in, mollis justo. Pellentesque
            porttitor auctor sapien, sit amet elementum turpis imperdiet ac. Cras luctus, sem vel finibus vehicula,
            mauris tellus iaculis orci, sit amet sodales velit augue non felis. Nullam vehicula gravida justo non
            lacinia.
          </p>
          <p>${nestedTemplate(data)}</p>
          <p>
            Mauris lobortis, nisl vitae hendrerit vulputate, est lacus efficitur ipsum, nec blandit nisi diam in dolor.
            Proin ${JSON.stringify(data)} laoreet nisi a vulputate. Praesent non congue quam, ut sodales risus.
            Curabitur ornare elit at suscipit pulvinar. Suspendisse vitae orci a justo laoreet vestibulum quis et ex.
            Integer nec risus aliquam, convallis erat in, dignissim sapien. Suspendisse metus felis, volutpat a tempus
            ut, semper in tortor. Mauris rutrum dui in elit blandit, non vestibulum felis cursus. Sed mollis consectetur
            eros a lobortis. Sed lobortis lorem eu metus auctor tempus. Sed faucibus sit amet urna vel accumsan. Cras
            luctus in lorem ac tempor. Sed ullamcorper consectetur ligula sed malesuada.
          </p>
          <p .prop="${data.title}" ?visible="${data.isTrue}">${nestedTemplate(data)}</p>
        </main>
      </body>
    </html>
  `;
}

function nestedTemplate(data) {
  return html`
    <p>
      Lorem ipsum ${data.number} sit amet, consectetur adipiscing elit. Nunc molestie lacus eget ipsum pellentesque,
      quis ullamcorper enim semper.
    </p>
    <p>
      Lorem ipsum dolor sit ${data.number}, consectetur adipiscing elit. Nunc molestie lacus eget ipsum pellentesque,
      quis ullamcorper enim semper.
    </p>
  `;
}
