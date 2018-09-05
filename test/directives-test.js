'use strict';

const { directive, html, render } = require('../index.js');
const { expect } = require('chai');
const getStream = require('get-stream');
const guard = require('../directives/guard.js');
const ifDefined = require('../directives/if-defined.js');
const repeat = require('../directives/repeat.js');
const unsafe = require('../directives/unsafe-html.js');
const until = require('../directives/until.js');
const when = require('../directives/when.js');

describe('directives', () => {
  describe('guard', () => {
    it('should render a simple guarded value', async () => {
      const template = html`<h1>Some ${guard('title', () => 'title')}</h1>`;
      expect(await getStream(render(template))).to.equal('<h1>Some title</h1>');
    });
    it('should render a guarded array value', async () => {
      const items = [1, 2, 3];
      const template = html`<h1>Some ${guard(items, () =>
        items.map((item) => html`${item}`)
      )}</h1>`;
      expect(await getStream(render(template))).to.equal('<h1>Some 123</h1>');
    });
  });

  describe('if-defined', () => {
    it('should render an attribute value if defined', async () => {
      const className = 'hi';
      const template = html`<div class=${ifDefined(className)}></div>`;
      expect(await getStream(render(template))).to.equal('<div class="hi"></div>');
    });
    it('should not render an attribute value if undefined', async () => {
      const className = undefined;
      const template = html`<div class=${ifDefined(className)}></div>`;
      expect(await getStream(render(template))).to.equal('<div ></div>');
    });
  });

  describe('repeat', () => {
    it('should render an array of values', async () => {
      const template = html`<ul>${repeat(
        [1, 2, 3],
        (i, index) => html`<li>${index}: ${i}</li>`
      )}</ul>`;
      expect(await getStream(render(template))).to.equal(
        '<ul><li>0: 1</li><li>1: 2</li><li>2: 3</li></ul>'
      );
    });
  });

  describe('unsafe-html', () => {
    it('should render unescaped value', async () => {
      const template = html`<p>${unsafe("hey! it's dangerous! <script>boom!</script>")}</p>`;
      expect(await getStream(render(template))).to.equal(
        "<p>hey! it's dangerous! <script>boom!</script></p>"
      );
    });
  });

  describe('until', () => {
    it('should render default value', async () => {
      const template = html`<p>${until(Promise.resolve('hi'), html`<span>Loading...</span>`)}</p>`;
      expect(await getStream(render(template))).to.equal('<p><span>Loading...</span></p>');
    });
  });

  describe('when', () => {
    it('should render the true template when the condition is truthy', async () => {
      const template = html`<p>${when(
        true,
        () => html`Checkmark is checked`,
        () => html`Checkmark is not checked`
      )}</p>`;
      expect(await getStream(render(template))).to.equal('<p>Checkmark is checked</p>');
    });
    it('should render the false template when the condition is falsey', async () => {
      const template = html`<p>${when(
        false,
        () => html`Checkmark is checked`,
        () => html`Checkmark is not checked`
      )}</p>`;
      expect(await getStream(render(template))).to.equal('<p>Checkmark is not checked</p>');
    });
  });

  describe('custom', () => {
    it('should allow writing custom directives', async () => {
      const custom = () => {
        return directive((part) => {
          part.setValue("custom's");
        });
      };
      const template = html`<p>${custom()}</p>`;
      expect(await getStream(render(template))).to.equal('<p>custom&#x27;s</p>');
    });
  });
});
