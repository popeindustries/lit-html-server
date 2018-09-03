[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html-server.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html-server)
[![Build Status](https://img.shields.io/travis/popeindustries/lit-html-server.svg?style=flat)](https://travis-ci.org/popeindustries/lit-html-server)

# lit-html-server

Render [**lit-html**](https://polymer.github.io/lit-html/) templates on the server as Node.js streams. Supports all **lit-html** types and special attribute bindings.

> Although based on **lit-html** semantics, **lit-html-server** is a great general purpose HTML template streaming library. Tagged template literals are a native JavaScript feature, and the HTML rendered is 100% standard markup, with no special syntax or client-side runtime dependencies.

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
    <p class="${data.invertedText ? 'negative' : ''}">${data.text}</p>`;
}
```

...and render:

```js
const { render } = require('@popeindustries/lit-html-server');

// Returns a Node.js Readable stream which can be piped to `response`
render(layout({ title: 'Home', api: '/api/home' }));
```

## TODO

- [x] html escape values
- [x] handle special attribute bindings (`?.@`)
- [x] add missing attribute quotes
- [x] support sync iterators
- [x] port default directives
- [ ] ~~support async iterators~~ (wait until no longer experimental)

## Thanks!

Thanks to [Thomas Parslow](https://github.com/almost) for the [stream-template](https://github.com/almost/stream-template) library that was the basis for this streaming implementation, and thanks to [Justin Fagnani](https://github.com/justinfagnani) and the [team](https://github.com/Polymer/lit-html/graphs/contributors) behind the **lit-html** project!
