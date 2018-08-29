[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html-server.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html-server)
[![Build Status](https://img.shields.io/travis/popeindustries/lit-html-server.svg?style=flat)](https://travis-ci.org/popeindustries/lit-html-server)

# lit-html-server

Render [**lit-html**](https://polymer.github.io/lit-html/) templates on the server as Node.js streams. Supports all **lit-html** types and special attribute bindings.

## Usage

Install with `npm/yarn`:

```bash
$ npm install --save @popeindustries/lit-html-server
```

...write your **lit-html** template:

```js
const { html } = require('@popeindustries/lit-html-server');

function layout(data) {
  return html`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
    </head>
    <body>
      ${body(data.api)}
    </body>
    </html>`;
}

async function body(apiPath) {
  // Some Promise-based request method
  const data = await fetchRemoteData(apiPath);

  return html`<h1>${data.title}</h1>
    <x-widget ?enabled=${data.hasWidget}></x-widget>
    <p class=${data.invertedText ? 'negative' : ''}>${data.text}</p>`;
}
```

...and render:

```js
const { render } = require('lit-html-server');

// Returns a Node.js Readable stream
render(layout({ title: 'Home', api: '/api/home' }));
```

## Thanks

Thanks to [Thomas Parslow](https://github.com/almost) for the [stream-template](https://github.com/almost/stream-template) library that was the basis for this streaming implementation, and thanks to [Justin Fagnani](https://github.com/justinfagnani) the [team](https://github.com/Polymer/lit-html/graphs/contributors) behind the **lit-html** project!
