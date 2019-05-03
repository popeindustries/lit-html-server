[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html-server.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html-server)
[![Build Status](https://img.shields.io/travis/popeindustries/lit-html-server.svg?style=flat)](https://travis-ci.org/popeindustries/lit-html-server)

# lit-html-server

Render [**lit-html**](https://polymer.github.io/lit-html/) templates on the server as strings or streams (and in the browser too!). Supports all **lit-html** types, special attribute expressions, and many of the standard directives.

> Although based on **lit-html** semantics, **lit-html-server** is a great general purpose HTML template streaming library. Tagged template literals are a native JavaScript feature, and the HTML rendered is 100% standard markup, with no special syntax or runtime required!

## Usage

Install with `npm/yarn`:

```bash
$ npm install --save @popeindustries/lit-html-server
```

...write your **lit-html** template:

```js
const { html } = require('@popeindustries/lit-html-server');
const { classMap } = require('@popeindustries/lit-html-server/directives/class-map.js');
const { until } = require('@popeindustries/lit-html-server/directives/until.js');

function Layout(data) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${data.title}</title>
      </head>
      <body>
        ${until(Body(data.api))}
      </body>
    </html>
  `;
}

async function Body(api) {
  // Some Promise-based request method
  const data = await fetchRemoteData(api);

  return html`
    <h1>${data.title}</h1>
    <x-widget ?enabled="${data.hasWidget}"></x-widget>
    <p class="${classMap({ negative: data.invertedText })}">${data.text}</p>
  `;
}
```

...and render (plain HTTP server example, though similar for Express/Fastify/etc):

```js
const http = require('http');
const { renderToStream } = require('@popeindustries/lit-html-server');

http
  .createServer((request, response) => {
    const data = { title: 'Home', api: '/api/home' };

    response.writeHead(200);
    // Returns a Node.js Readable stream which can be piped to "response"
    renderToStream(Layout(data)).pipe(response);
  }
```

## Universal Templates

With **lit-html-server** and **lit-html** it's possible to write a single template and render it on the server, in a ServiceWorker, and in the browser. In order to be able to render the same template in three different runtime environments, it's necessary to change the version of `html` and `directives` used to process the template. It would certainly be possible to alias imports using a build process (so that `import { html } from 'lit-html'` points to `@popeindustries/lit-html-server` for bundles run in server/ServiceWorker), but a more flexible approach would be to pass references directly to the templates (dependency injection):

```js
/**
 * layout.js
 */
import Body from './body.js';

export function Layout(context, data) {
  const {
    html,
    directives: { until }
  } = context;

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${data.title}</title>
      </head>
      <body>
        ${until(Body(context, data.api))}
      </body>
    </html>
  `;
}

/**
 * server.js
 * (transpiler or experimental modules required)
 */
import { html, renderToStream } from '@popeindustries/lit-html-server';
import { Layout } from './layout.js';
import { until } from '@popeindustries/lit-html-server/directives/until.js';

const context = {
  html,
  directives: {
    until
  }
};

http
  .createServer((request, response) => {
    response.writeHead(200);
    renderToStream(Layout(context, data)).pipe(response);
  }

/**
 * service-worker.js
 * (bundler required)
 */
import { html, renderToStream } from '@popeindustries/lit-html-server/browser/index.js';
import { Layout } from './layout.js';
import { until } from '@popeindustries/lit-html-server/browser/directives/until.js';

const context = {
  html,
  directives: {
    until
  }
};

self.addEventListener('fetch', (event) => {
  const stream = renderToStream(Layout(context, data));
  const response = new Response(stream, {
    headers: {
      'content-type': 'text/html'
    }
  });

  event.respondWith(response);
});

/**
 * browser.js
 */
import { html, render } from 'lit-html';
import { Layout } from './layout.js';
import { until } from 'lit-html/directives/until.js';

const context = {
  html,
  directives: {
    until
  }
};

render(Layout(context, data), document.body);
```

## API (Node.js)

### `html`

The tag function to apply to HTML template literals (also aliased as `svg`):

```js
const { html } = require('@popeindustries/lit-html-server');

const name = 'Bob';
html`
  <h1>Hello ${name}!</h1>
`;
```

All template expressions (values interpolated with `${value}`) are escaped for securely including in HTML by default. An `unsafe-html` [directive](#directives) is available to disable escaping:

```js
const { html } = require('@popeindustries/lit-html-server');
const { unsafeHTML } = require('@popeindustries/lit-html-server/directives/unsafe-html.js');

html`
  <div>${unsafeHTML('<span>danger!</span>')}</div>
`;
```

### `renderToStream(TemplateResult): Readable`

Returns the result of the template tagged by `html` as a Node.js `Readable` stream of markup:

```js
const { html, renderToStream } = require('@popeindustries/lit-html-server');

const name = 'Bob';
renderToStream(
  html`
    <h1>Hello ${name}!</h1>
  `
).pipe(response);
```

### `renderToString(TemplateResult): Promise<string>`

Returns the result of the template tagged by `html` as a Promise which resolves to a string of markup:

```js
const { html, renderToString } = require('@popeindustries/lit-html-server');

const name = 'Bob';
const markup = await renderToString(
  html`
    <h1>Hello ${name}!</h1>
  `
);
response.end(markup);
```

### `renderToBuffer(TemplateResult): Promise<Buffer>`

Returns the result of the template tagged by `html` as a Promise which resolves to a Buffer of markup:

```js
const { html, renderToBuffer } = require('@popeindustries/lit-html-server');

const name = 'Bob';
const markup = await renderToBuffer(
  html`
    <h1>Hello ${name}!</h1>
  `
);
response.end(markup);
```

## API (Browser)

**lit-html-server** may also be used in the browser to render strings of markup, or in a Service Worker script to render streams of markup.

### `html`

The tag function to apply to HTML template literals (also aliased as `svg`):

```js
import { html } from '@popeindustries/lit-html-server';

const name = 'Bob';
html`
  <h1>Hello ${name}!</h1>
`;
```

### `renderToStream(TemplateResult): ReadableStream`

Returns the result of the template tagged by `html` as a `ReadableStream` stream of markup. This may be used in a Service Worker script to stream an html response to the browser:

```js
import { html, renderToStream } from '@popeindustries/lit-html-server';

self.addEventListener('fetch', (event) => {
  const name = 'Bob';
  const stream = renderToStream(
    html`
      <h1>Hello ${name}!</h1>
    `
  );
  const response = new Response(stream, {
    headers: {
      'content-type': 'text/html'
    }
  });

  event.respondWith(response);
});
```

> _NOTE: a bundler is required to package modules for use in a Service Worker_

### `renderToString(TemplateResult): Promise<string>`

Returns the result of the template tagged by `html` as a Promise which resolves to a string of markup:

```js
import { html, renderToString } from '@popeindustries/lit-html-server';
const name = 'Bob';
const markup = await renderToString(
  html`
    <h1>Hello ${name}!</h1>
  `
);
document.body.innerHtml = markup;
```

## Writing templates

In general, all of the standard **lit-html** rules and semantics apply when rendering templates on the server with **lit-html-server** (read more about [**lit-html**](https://polymer.github.io/lit-html/guide/) and writing templates [here](https://polymer.github.io/lit-html/guide/writing-templates.html)).

### Template structure

Although there are no technical restrictions for doing so, if you plan on writing templates for use on both the server and client, you should abide by the same rules:

- templates should be well-formed when all expressions are replaced with empty values
- expressions should only occur in attribute-value and text-content positions
- expressions should not appear where tag or attribute names would appear
- templates can have multiple top-level elements and text
- templates should not contain unclosed elements

### Expressions

All of the **lit-html** [expression syntax](https://polymer.github.io/lit-html/guide/writing-templates.html#binding-types) is supported:

- text:

```js
html`
  <h1>Hello ${name}</h1>
`;
//=> <h1>Hello Bob</h1>
```

- attribute:

```js
html`
  <div id="${id}"></div>
`;
//=> <div id="main"></div>
```

- boolean attribute (attribute markup removed with falsey expression values):

```js
html`
  <input type="checkbox" ?checked="${checked}" />
`;
//=> <input type="checkbox" checked> if truthy
//=> <input type="checkbox" > if falsey
```

- property (attribute markup removed):

```js
html`
  <input .value="${value}" />
`;
//=> <input />
```

- event handler (attribute markup removed):

```js
const fn = (e) => console.log('clicked');
html`
  <button @click="${fn}">Click Me</button>
`;
//=> <button >Click Me</button>
```

### Types

Most of the **lit-html** [value types](https://polymer.github.io/lit-html/guide/writing-templates.html#supported-types) are supported:

- primitives: `String`, `Number`, `Boolean`, `null`, and `undefined`

  > note that `undefined` handling is the same as in **lit-html**: stringified when used as an attribute value, and ignored when used as a node value

- nested templates:

```js
const header = html`
  <h1>Header</h1>
`;
const page = html`
  ${header}
  <p>This is some text</p>
`;
```

- Arrays / iterables (sync):

```js
const items = [1, 2, 3];
html`
  <ul>
    ${items.map(
      (item) =>
        html`
          <li>${item}</li>
        `
    )}
  </ul>
`;
html`
  <p>total = ${new Set(items)}</p>
`;
```

- Promises:

```js
const promise = fetch('sample.txt').then((r) => r.text());
html`
  <p>The response is ${promise}.</p>
`;
```

> Note that **lit-html** no longer supports Promise values. Though **lit-html-server** does, it's recommended to use the `until` directive instead.

### Directives

Most of the built-in **lit-html** [directives](https://polymer.github.io/lit-html/guide/writing-templates.html#directives) are also included for compatibility when using templates on the server and client (even though some directives are no-ops in a server rendered context):

> _NOTE: directives for use in the browser are imported from `@popeindustries/lit-html-server/browser/directives`_

- `asyncAppend(value)`: Renders the items of an AsyncIterable, appending new values after previous values:

```js
const asyncAppend = require('@popeindustries/lit-html-server/directives/async-append.js');

html`
  <ul>
    ${asyncAppend(someListIterator)}
  </ul>
`;
```

- `cache(value)`: Enables fast switching between multiple templates by caching previous results. Since it's generally not desireable to cache between requests, this is a no-op:

```js
const cache = require('@popeindustries/lit-html-server/directives/cache.js');

cache(
  loggedIn
    ? html`
        You are logged in
      `
    : html`
        Please log in
      `
);
```

- `classMap(classInfo)`: applies css classes to the `class` attribute. 'classInfo' keys are added as class names if values are truthy:

```js
const classMap = require('@popeindustries/lit-html-server/directives/class-map.js');

html`
  <div class="${classMap({ red: true })}"></div>
`;
```

- `guard(value, fn)`: no-op since re-rendering does not apply (renders result of `fn`):

```js
const guard = require('@popeindustries/lit-html-server/directives/guard.js');

html`
  <div>
    ${guard(items, () =>
      items.map(
        (item) =>
          html`
            ${item}
          `
      )
    )}
  </div>
`;
```

- `ifDefined(value)`: sets the attribute if the value is defined and removes the attribute if the value is undefined:

```js
const ifDefined = require('@popeindustries/lit-html-server/directives/if-defined.js');

html`
  <div class="${ifDefined(className)}"></div>
`;
```

- `repeat(items, keyfnOrTemplate, template))`: no-op since re-rendering does not apply (maps `items` over `template`)

```js
const repeat = require('@popeindustries/lit-html-server/directives/repeat.js');

html`
  <ul>
    ${repeat(
      items,
      (i) => i.id,
      (i, index) =>
        html`
          <li>${index}: ${i.name}</li>
        `
    )}
  </ul>
`;
```

- `styleMap(styleInfo)`: applies css properties to the `style` attribute. 'styleInfo' keys and values are added as style properties:

```js
const styleMap = require('@popeindustries/lit-html-server/directives/style-map.js');

html`
  <div style="${styleMap({ color: 'red' })}"></div>
`;
```

- `until(...args)`: renders one of a series of values, including Promises, in priority order. Since it's not possible to render more than once in a server context, primitive synchronous values are prioritized over asynchronous Promises. If no synchronous values are passed, the last value is rendered regardless of type:

```js
const until = require('@popeindustries/lit-html-server/directives/until.js');

html`
  <p>
    ${until(
      fetch('content.json').then((r) => r.json()),
      html`
        <span>Loading...</span>
      `
    )}
  </p>
`;
// => renders <p><span>Loading...</span></p>

html`
  <p>
    ${until(
      fetch('content.json').then((r) => r.json()),
      isBrowser
        ? html`
            <span>Loading...</span>
          `
        : undefined
    )}
  </p>
`;
// => renders fetch result
```

## Thanks!

Thanks to [Thomas Parslow](https://github.com/almost) for the [stream-template](https://github.com/almost/stream-template) library that was the basis for this streaming implementation, and thanks to [Justin Fagnani](https://github.com/justinfagnani) and the [team](https://github.com/Polymer/lit-html/graphs/contributors) behind the **lit-html** project!
