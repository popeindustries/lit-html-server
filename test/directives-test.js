import { directive, html as h, renderToString as render } from '../index.mjs';
import { asyncAppend } from '../directives/async-append.mjs';
import { asyncReplace } from '../directives/async-replace.mjs';
import { cache } from '../directives/cache.mjs';
import { classMap } from '../directives/class-map.mjs';
import { createAsyncIterable } from './utils.js';
import { expect } from 'chai';
import { guard } from '../directives/guard.mjs';
// import { hydrate } from '../directives/hydrate.mjs';
import { ifDefined } from '../directives/if-defined.mjs';
import { repeat } from '../directives/repeat.mjs';
import { styleMap } from '../directives/style-map.mjs';
import { unsafeHTML } from '../directives/unsafe-html.mjs';
import { until } from '../directives/until.mjs';

describe('directives', () => {
  describe('asyncAppend', () => {
    it('should render an AsyncIterable value', async () => {
      const result = h`some ${asyncAppend(createAsyncIterable(['async', ' text']))}`;
      expect(await render(result)).to.equal('some async text');
    });
    it('should render a mapped AsyncIterable value', async () => {
      const result = h`some ${asyncAppend(createAsyncIterable(['async', 'text']), (v, index) => {
        return `${index}-${v.toUpperCase()}`;
      })}`;
      expect(await render(result)).to.equal('some 0-ASYNC1-TEXT');
    });
  });

  describe('asyncReplace', () => {
    it('should render an AsyncIterable value', async () => {
      const result = h`some ${asyncReplace(createAsyncIterable(['async', ' text']))}`;
      expect(await render(result)).to.equal('some async');
    });
    it('should render a mapped AsyncIterable value', async () => {
      const result = h`some ${asyncReplace(createAsyncIterable(['async', 'text']), (v, index) => {
        return `${index}-${v.toUpperCase()}`;
      })}`;
      expect(await render(result)).to.equal('some 0-ASYNC');
    });
  });

  describe('cache', () => {
    it('should render a cached value', async () => {
      const result = h`some ${cache('text')}`;
      expect(await render(result)).to.equal('some text');
    });
  });

  describe('classMap', () => {
    it('should throw if not used as attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div>${classMap({ red: true })}</div>`;
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should throw if not used as "class" attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div color="${classMap({ red: true })}"></div>`;
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should include class name if truthy', async () => {
      const result = h`<div class="${classMap({ red: true })}"></div>`;
      expect(await render(result)).to.equal('<div class="red"></div>');
    });
    it('should include class names if truthy', async () => {
      const result = h`<div class="${classMap({ red: true, blue: true })}"></div>`;
      expect(await render(result)).to.equal('<div class="red blue"></div>');
    });
    it('should ignore class names if falsey', async () => {
      const result = h`<div class="${classMap({ red: false, blue: true })}"></div>`;
      expect(await render(result)).to.equal('<div class="blue"></div>');
    });
  });

  describe('guard', () => {
    it('should render a simple guarded value', async () => {
      const result = h`some ${guard('title', () => 'text')}`;
      expect(await render(result)).to.equal('some text');
    });
    it('should render a guarded array value', async () => {
      const items = [1, 2, 3];
      const result = h`some ${guard(items, () => items.map((item) => item))}`;
      expect(await render(result)).to.equal('some 123');
    });
  });

  describe('if-defined', () => {
    it('should render an attribute value if defined', async () => {
      const className = 'hi';
      const result = h`<div class="${ifDefined(className)}"></div>`;
      expect(await render(result)).to.equal('<div class="hi"></div>');
    });
    it('should not render an attribute value if undefined', async () => {
      const className = undefined;
      const result = h`<div class="${ifDefined(className)}"></div>`;
      expect(await render(result)).to.equal('<div ></div>');
    });
  });

  describe('repeat', () => {
    it('should render an array of values', async () => {
      const repeater = (i, index) => h`<li>${index}: ${i}</li>`;
      const result = h`<ul>${repeat([1, 2, 3], repeater)}</ul>`;
      expect(await render(result)).to.equal('<ul><li>0: 1</li><li>1: 2</li><li>2: 3</li></ul>');
    });
  });

  describe('styleMap', () => {
    it('should throw if not used as attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div>${styleMap({ color: 'red' })}</div>`;
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should throw if not used as "style" attribute value', async () => {
      let errored = false;
      try {
        const result = h`<div class="${styleMap({ color: 'red' })}"></div>`;
        expect(result).to.not.exist;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
    it('should include style properties', async () => {
      const result = h`<div style="${styleMap({
        color: 'red',
        border: '1px solid black'
      })}"></div>`;
      expect(await render(result)).to.equal(
        '<div style="color: red; border: 1px solid black"></div>'
      );
    });
  });

  describe('unsafe-html', () => {
    it('should render unescaped value', async () => {
      const result = h`<p>${unsafeHTML("hey! it's dangerous! <script>boom!</script>")}</p>`;
      expect(await render(result)).to.equal("<p>hey! it's dangerous! <script>boom!</script></p>");
    });
  });

  describe('until', () => {
    it('should render a pending value', async () => {
      const result = h`<p>${until(Promise.resolve('hi'), h`<span>Loading...</span>`)}</p>`;
      expect(await render(result)).to.equal('<p><span>Loading...</span></p>');
    });
    it('should render a Promise value if no values pending', async () => {
      const result = h`<p>${until(Promise.resolve('hi'))}</p>`;
      expect(await render(result)).to.equal('<p>hi</p>');
    });
  });

  describe('custom', () => {
    it('should allow writing custom directives', async () => {
      const custom = directive(() => (part) => {
        part.setValue("custom's");
      });
      const result = h`<p>${custom()}</p>`;
      expect(await render(result)).to.equal('<p>custom&#x27;s</p>');
    });
    it('should give correct tagName', async () => {
      let actualTagName = 'not-set';
      const custom = directive(() => (part) => {
        const { tagName } = part;
        actualTagName = tagName;
        part.setValue(tagName);
      });
      const result = h`<my-static-element>${custom()}</my-static-element>`;
      await render(result);
      expect(actualTagName).to.equal('my-static-element');
    });
    it('should give correct tagName when tag has space', async () => {
      let actualTagName = 'not-set';
      const custom = directive(() => (part) => {
        const { tagName } = part;
        actualTagName = tagName;
        part.setValue(tagName);
      });
      const result = h`<my-static-element >${custom()}</my-static-element>`;
      await render(result);
      expect(actualTagName).to.equal('my-static-element');
    });
    it('should give correct tagName when tag has attribute', async () => {
      let actualTagName = 'not-set';
      const custom = directive(() => (part) => {
        const { tagName } = part;
        actualTagName = tagName;
        part.setValue(tagName);
      });
      const result = h`<my-static-element class="something">${custom()}</my-static-element>`;
      await render(result);
      expect(actualTagName).to.equal('my-static-element');
    });
    it('should give correct tagName with dynamic attribute value', async () => {
      let actualTagName = 'not-set';
      const custom = directive(() => (part) => {
        const { tagName } = part;
        actualTagName = tagName;
        part.setValue(tagName);
      });
      const myClass = 'something';
      const result = h`<my-static-element class="${myClass}">${custom()}</my-static-element>`;
      await render(result);
      expect(actualTagName).to.equal('my-static-element');
    });
  });
});
