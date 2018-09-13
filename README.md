[![NPM Version](https://img.shields.io/npm/v/@popeindustries/lit-html-server.svg?style=flat)](https://npmjs.org/package/@popeindustries/lit-html-server)
[![Build Status](https://img.shields.io/travis/popeindustries/lit-html-server.svg?style=flat)](https://travis-ci.org/popeindustries/lit-html-server)

# lit-html-server

Render [**lit-html**](https://polymer.github.io/lit-html/) templates on the server as Node.js streams. Supports all **lit-html** types, special attribute expressions, and most of the standard directives.

> Although based on **lit-html** semantics, **lit-html-server** is a great general purpose HTML template streaming library. Tagged template literals are a native JavaScript feature, and the HTML rendered is 100% standard markup, with no special syntax or client-side runtime required.

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

## API

### `html`

The tag function to apply to HTML template literals (also aliased as `svg`)

```js
const name = 'Bob';
html`<h1>Hello ${name}!</h1>`;
```

All template expressions (values interpolated with `${value}`) are escaped for securely including in HTML by default. An `unsafe-html` [directive](#directives) is available to disable escaping:

```js
const unsafe = require('@popeindustries/lit-html-server/directives/unsafe-html.js');
html`<div>
  ${unsafe('<span>dangerous!</span>')}
</div>`;
```

### `render(template: string|Readable): Readable`

Returns the result of the template tagged by `html` as a Node.js `Readable` stream of markup.

```js
render(html`<h1>Hello ${name}!</h1>`).pipe(response);
```

### `renderToString(template: string|Readable): Promise<string>`

Returns the result of the template tagged by `html` as a Promise which resolves to a string of markup.

```js
const markup = await renderToString(html`<h1>Hello ${name}!</h1>`);
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
html`<h1>Hello ${name}</h1>`;
//=> <h1>Hello Bob</h1>
```

- attribute:

```js
html`<div id=${id}></div>`;
//=> <div id="main"></div>
```

- boolean attribute (attribute markup removed with falsey expression values):

```js
html`<input type="checkbox" ?checked=${checked}>`;
//=> <input type="checkbox" checked> if truthy
//=> <input type="checkbox" > if falsey
```

- property (attribute markup removed):

```js
html`<input .value=${value}>`;
//=> <input >
```

- event handler (attribute markup removed):

```js
const fn = (e) => console.log('clicked');
html`<button @click=${fn}>Click Me</button>`;
//=> <button >Click Me</button>
```

### Types

Most of the **lit-html** [value types](https://polymer.github.io/lit-html/guide/writing-templates.html#supported-types) are supported:

- primitives: `String`, `Number`, `Boolean`, `null`, and `undefined`

  > note that `undefined` handling is the same as in **lit-html**: stringified when used as an attribute value, and ignored when used as a node value

- nested templates:

```js
const header = html`<h1>Header</h1>`;
const page = html`
  ${header}
  <p>This is some text</p>
`;
```

- Arrays / iterables (sync):

```js
const items = [1, 2, 3];
html`<ul>${items.map((item) => html`<li>${item}</li>`)}</ul>`;
html`<p>total = ${new Set(items)}</p>`;
```

- Promises:

```js
const promise = fetch('sample.txt').then((r) => r.text());
html`<p>The response is ${promise}.</p>`;
```

### Directives

Most of the built-in **lit-html** [directives](https://polymer.github.io/lit-html/guide/writing-templates.html#directives) are also included for compatibility when using templates on the server and client (even though some directives are no-ops in a server context):

- `guard(expression, valueFn)`: no-op since re-rendering does not apply (renders result of `valueFn`)

```js
const guard = require('@popeindustries/lit-html-server/directives/guard.js');
html`<div>
  ${guard(items, () => items.map((item) => html`${item}`))}
</div>`;
```

- `ifDefined(value)`: sets the attribute if the value is defined and removes the attribute if the value is undefined

```js
const ifDefined = require('@popeindustries/lit-html-server/directives/if-defined.js');
html`<div class=${ifDefined(className)}></div>`;
```

- `repeat(items, keyfn, template))`: no-op since re-rendering does not apply (maps `items` over `template`)

```js
const repeat = require('@popeindustries/lit-html-server/directives/repeat.js');
html`<ul>
  ${repeat(items, (i) => i.id, (i, index) => html`<li>${index}: ${i.name}</li>`)}
</ul>`;
```

- `until(promise, defaultContent)`: no-op since only one render pass (renders `defaultContent`)

```js
const until = require('@popeindustries/lit-html-server/directives/until.js');
html`<p>
  ${until(fetch('content.txt').then((r) => r.text()), html`<span>Loading...</span>`)}
</p>`;
```

- `when(condition, trueTemplate, falseTemplate)`: switches between two templates based on the given condition (does not cache templates)

```js
const when = require('@popeindustries/lit-html-server/directives/when.js');
html`<p>
  ${when(checked, () => html`Checkmark is checked`, () => html`Checkmark is not checked`)}
</p>`;
```

- `classMap(classInfo)`: applies css classes to the `class` attribute. 'classInfo' keys are added as class names if values are truthy

```js
const classMap = require('@popeindustries/lit-html-server/directives/classMap.js');
html`<div class=${classMap({ red: true })}></div>`;
```

- `styleMap(styleInfo)`: applies css properties to the `style` attribute. 'styleInfo' keys and values are added as style properties

```js
const styleMap = require('@popeindustries/lit-html-server/directives/styleMap.js');
html`<div style=${styleMap({ color: 'red' })}></div>`;
```

## Thanks!

Thanks to [Thomas Parslow](https://github.com/almost) for the [stream-template](https://github.com/almost/stream-template) library that was the basis for this streaming implementation, and thanks to [Justin Fagnani](https://github.com/justinfagnani) and the [team](https://github.com/Polymer/lit-html/graphs/contributors) behind the **lit-html** project!
