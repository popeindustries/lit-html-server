'use strict';

const { html, renderToStream } = require('../index.js');
const http = require('http');

http
  .createServer((req, res) => {
    const d = new Date();
    res.writeHead(200);
    renderToStream(template({ title: d.toISOString(), isTrue: Math.random() > 0.5 })).pipe(res);
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
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc molestie lacus eget ipsum
            pellentesque, quis ullamcorper enim semper. Curabitur non dignissim felis. Donec rhoncus
            faucibus ultrices. Sed ut orci ut leo luctus vestibulum. In iaculis dolor sed ante
            pulvinar consequat. In nec metus tempor, fermentum tellus nec, pulvinar enim. Ut ex dui,
            pellentesque eget ipsum ut, elementum iaculis purus. Sed sed egestas mi.
          </p>
          <p>
            Duis eleifend nec lectus a malesuada. Suspendisse placerat mollis porta. Pellentesque
            nec quam non sapien facilisis ultricies quis nec risus. Quisque feugiat dui quis lectus
            iaculis, molestie pretium augue tincidunt. Suspendisse potenti. Pellentesque habitant
            morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse quis
            libero sagittis, vulputate magna in, laoreet sem. Ut elementum nunc eget libero
            hendrerit eleifend at eget sem. Sed vel urna consequat, interdum massa in, mollis justo.
            Pellentesque porttitor auctor sapien, sit amet elementum turpis imperdiet ac. Cras
            luctus, sem vel finibus vehicula, mauris tellus iaculis orci, sit amet sodales velit
            augue non felis. Nullam vehicula gravida justo non lacinia.
          </p>
          <p>
            ${wait(`Nam vel libero metus. Fusce euismod turpis nec ligula finibus, vel placerat felis consequat. Nam nisi erat,
        tincidunt et fringilla vel, volutpat sed nisi. Integer non eleifend purus. Cras eget urna cursus, ullamcorper elit
        ac, iaculis odio. Quisque et leo ac ante pellentesque semper. Nulla interdum lacus nunc, et facilisis nunc vestibulum
        quis. Vestibulum suscipit molestie fermentum. Nulla quis semper nibh. Nam accumsan cursus lectus ac imperdiet.`)}
          </p>
          <p>
            Mauris lobortis, nisl vitae hendrerit vulputate, est lacus efficitur ipsum, nec blandit
            nisi diam in dolor. Proin sollicitudin laoreet nisi a vulputate. Praesent non congue
            quam, ut sodales risus. Curabitur ornare elit at suscipit pulvinar. Suspendisse vitae
            orci a justo laoreet vestibulum quis et ex. Integer nec risus aliquam, convallis erat
            in, dignissim sapien. Suspendisse metus felis, volutpat a tempus ut, semper in tortor.
            Mauris rutrum dui in elit blandit, non vestibulum felis cursus. Sed mollis consectetur
            eros a lobortis. Sed lobortis lorem eu metus auctor tempus. Sed faucibus sit amet urna
            vel accumsan. Cras luctus in lorem ac tempor. Sed ullamcorper consectetur ligula sed
            malesuada.
          </p>
          <p .prop="${data.title}" ?visible="${data.isTrue}">
            ${wait(`Fusce hendrerit massa venenatis elit accumsan, id varius elit
          varius. Fusce semper nisl non ligula faucibus hendrerit. Vestibulum et tellus non metus maximus viverra. Aenean scelerisque
          lacus urna, tristique varius tortor interdum vel. Ut ac euismod mauris, et pretium dolor. Phasellus mattis, libero
          quis fermentum tincidunt, massa orci tempor ante, eget tincidunt nunc libero ac eros. Fusce eget imperdiet purus. Sed
          sem odio, consequat at tellus at, mattis gravida risus. In eu arcu sed sapien condimentum iaculis in in neque. Duis
          condimentum ante lorem, quis elementum est aliquam ut. Ut imperdiet ex ac urna posuere, quis interdum nisl lacinia.
          Pellentesque lacus lacus, sodales sed dolor in, imperdiet vulputate dui. Aenean sed leo eu augue semper semper. Donec
          vulputate massa magna, semper lobortis purus luctus ac.`)}
          </p>
        </main>
      </body>
    </html>
  `;
}

function wait(content) {
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(content);
    }, Math.random() * 100);
  });
}
