import {
  classMap,
  guard,
  ifDefined,
  repeat,
  styleMap,
  unsafeHTML,
  until
} from '../src/directives/index.js';
import { directive, html, renderToString } from '../src/index.js';
import { expect } from 'chai';
import { normalizeWhitespace } from './utils.js';

describe.skip('directives', () => {
  describe('guard', () => {
    it('should render a simple guarded value', async () => {
      const template = html`
        <h1>Some ${guard('title', () => 'title')}</h1>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal('<h1>Some title</h1>');
    });
    it('should render a guarded array value', async () => {
      const items = [1, 2, 3];
      const template = html`
        <h1>Some ${guard(items, () => items.map((item) => item))}</h1>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal('<h1>Some 123</h1>');
    });
  });

  describe('if-defined', () => {
    it('should render an attribute value if defined', async () => {
      const className = 'hi';
      const template = html`
        <div class="${ifDefined(className)}"></div>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<div class="hi"></div>'
      );
    });
    it('should not render an attribute value if undefined', async () => {
      const className = undefined;
      const template = html`
        <div class="${ifDefined(className)}"></div>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal('<div ></div>');
    });
  });

  describe('repeat', () => {
    it('should render an array of values', async () => {
      const repeater = (i, index) =>
        html`
          <li>${index}: ${i}</li>
        `;
      const template = html`
        <ul>
          ${repeat([1, 2, 3], repeater)}
        </ul>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<ul> <li>0: 1</li> <li>1: 2</li> <li>2: 3</li> </ul>'
      );
    });
  });

  describe('unsafe-html', () => {
    it('should render unescaped value', async () => {
      const template = html`
        <p>${unsafeHTML("hey! it's dangerous! <script>boom!</script>")}</p>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        "<p>hey! it's dangerous! <script>boom!</script></p>"
      );
    });
  });

  describe('until', () => {
    it('should render a pending value', async () => {
      const template = html`
        <p>
          ${
            until(
              Promise.resolve('hi'),
              html`
                <span>Loading...</span>
              `
            )
          }
        </p>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<p> <span>Loading...</span> </p>'
      );
    });
    it('should render a Promise value if no values pending', async () => {
      const template = html`
        <p>${until(Promise.resolve('hi'))}</p>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal('<p> hi </p>');
    });
  });

  describe('custom', () => {
    it('should allow writing custom directives', async () => {
      const custom = directive(() => (part) => {
        part.setValue("custom's");
      });
      const template = html`
        <p>${custom()}</p>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal('<p>custom&#x27;s</p>');
    });
  });

  describe('classMap', () => {
    it('should throw if not used as attribute value', async () => {
      let errored = false;
      try {
        html`
          <div>${classMap({ red: true })}</div>
        `;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should throw if not used as "class" attribute value', async () => {
      let errored = false;
      try {
        html`
          <div color="${classMap({ red: true })}"></div>
        `;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should include class name if truthy', async () => {
      const template = html`
        <div class="${classMap({ red: true })}"></div>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<div class="red"></div>'
      );
    });
    it('should include class names if truthy', async () => {
      const template = html`
        <div class="${classMap({ red: true, blue: true })}"></div>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<div class="red blue"></div>'
      );
    });
    it('should ignore class names if falsey', async () => {
      const template = html`
        <div class="${classMap({ red: false, blue: true })}"></div>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<div class="blue"></div>'
      );
    });
  });

  describe('styleMap', () => {
    it('should throw if not used as attribute value', async () => {
      let errored = false;
      try {
        html`
          <div>${styleMap({ color: 'red' })}</div>
        `;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should throw if not used as "style" attribute value', async () => {
      let errored = false;
      try {
        html`
          <div class="${styleMap({ color: 'red' })}"></div>
        `;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should include style properties', async () => {
      const template = html`
        <div
          style="${
            styleMap({
              color: 'red',
              border: '1px solid black'
            })
          }"
        ></div>
      `;
      expect(normalizeWhitespace(await renderToString(template))).to.equal(
        '<div style="color: red; border: 1px solid black" ></div>'
      );
    });
  });
});
