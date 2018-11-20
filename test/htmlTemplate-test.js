'use strict';

const asyncHtmlTemplate = require('../lib/streamHtmlTemplate.js');
const { expect } = require('chai');
const getStream = require('get-stream');
const html = require('../lib/htmlTemplate.js')(asyncHtmlTemplate);
const { normalizeWhitespace } = require('./utils.js');

describe('html()', () => {
  describe('text mode', () => {
    it('should return a string when interpolating primitive values', () => {
      expect(
        normalizeWhitespace(
          html`
            hello ${'foo'}, you are ${2} right ${true}
          `
        )
      ).to.equal('<!-- lit-html-server --> hello foo, you are 2 right true');
    });
    it('should return a string when interpolating primitive values and nested templates', () => {
      const foo = html`
        ${'foo'}
      `;
      expect(
        normalizeWhitespace(html`
          hello ${foo}, you are ${2} right ${true}
        `)
      ).to.equal('<!-- lit-html-server --> hello foo , you are 2 right true');
    });
    it('should return a string when interpolating null values', () => {
      expect(
        normalizeWhitespace(html`
          hello ${null}, you are ${undefined} right ${true}
        `)
      ).to.equal('<!-- lit-html-server --> hello null, you are right true');
    });
    it('should return a string when interpolating Array values', () => {
      expect(
        normalizeWhitespace(html`
          hello ${[1, 2, 3]}
        `)
      ).to.equal('<!-- lit-html-server --> hello 123');
    });
    it('should return a string when interpolating sync iterator values', () => {
      expect(
        normalizeWhitespace(html`
          hello ${new Set([1, 2, 3])}
        `)
      ).to.equal('<!-- lit-html-server --> hello 123');
    });
    it('should return a stream when interpolating Promise values', async () => {
      expect(
        normalizeWhitespace(
          await getStream(
            html`
              hello ${Promise.resolve('foo')}
            `
          )
        )
      ).to.equal('hello foo');
    });
    it('should return a stream when nesting templates interpolating Promise values', async () => {
      expect(
        normalizeWhitespace(
          await getStream(
            html`
              hello
              ${
                html`
                  ${Promise.resolve('foo')}
                `
              }
            `
          )
        )
      ).to.equal('hello foo');
    });
    it('should return a stream when interpolating Array Promise values', async () => {
      const values = [1, 2, 3];
      expect(
        normalizeWhitespace(
          await getStream(
            html`
              hello ${values.map((value) => Promise.resolve(value))}
            `
          )
        )
      ).to.equal('hello 123');
    });
    it('should return a stream when interpolating Array Promise values with nested templates', async () => {
      const values = [1, 2, 3];
      expect(
        normalizeWhitespace(
          await getStream(
            html`
              hello
              ${
                values.map(
                  (value) =>
                    html`
                      ${Promise.resolve(value)}
                    `
                )
              }
            `
          )
        )
      ).to.equal('hello 1 2 3');
    });
  });

  describe('attribute mode', () => {
    it('should return a string when interpolating element attribute values', () => {
      expect(
        normalizeWhitespace(html`
          <a href="${'www.google.com'}" something="${undefined}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a href="www.google.com" something="undefined"></a>');
    });
    it('should return a string when interpolating multi-part element attribute values', () => {
      expect(
        normalizeWhitespace(html`
          <a class="${'one'}-${'two'}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a class="one-two"></a>');
    });
    it('should return a string with attribute when interpolating truthy boolean attribute bindings', () => {
      expect(
        normalizeWhitespace(html`
          <a ?enabled="${true}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a enabled></a>');
      expect(
        normalizeWhitespace(html`
          <a ?enabled="${true}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a enabled></a>');
    });
    it('should return a string without attribute when interpolating falsy boolean attribute bindings', () => {
      expect(
        normalizeWhitespace(html`
          <a ?enabled="${false}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a ></a>');
      expect(
        normalizeWhitespace(html`
          <a ?enabled="${false}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a ></a>');
    });
    it('should return a string without attribute when interpolating property attribute bindings', () => {
      expect(
        normalizeWhitespace(html`
          <a .enabled="${false}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a ></a>');
      expect(
        normalizeWhitespace(html`
          <a .enabled="${false}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a ></a>');
    });
    it('should return a string without attribute when interpolating event handler attribute bindings', () => {
      expect(
        normalizeWhitespace(html`
          <a @click="${(evt) => console.log(evt)}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a ></a>');
      expect(
        normalizeWhitespace(html`
          <a @click="${(evt) => console.log(evt)}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a ></a>');
    });
    it('should return a string with quoted attribute when interpolating element attribute value missing quotes', () => {
      expect(
        normalizeWhitespace(html`
          <a href="${'www.google.com'}"></a>
        `)
      ).to.equal('<!-- lit-html-server --> <a href="www.google.com"></a>');
    });
    it('should return a string when interpolating multiple attribute values', () => {
      expect(
        normalizeWhitespace(html`
          <a href="${'www.google.com'}" ?enabled="${true}" class="link ${'one'} ${'two'}"></a>
        `)
      ).to.equal(
        '<!-- lit-html-server --> <a href="www.google.com" enabled class="link one two"></a>'
      );
    });
    it('should return a string when interpolating multiple attribute values in different elements', () => {
      expect(
        normalizeWhitespace(html`
          <a href="${'www.google.com'}"><span ?enabled="${true}" class="link"></span></a>
        `)
      ).to.equal(
        '<!-- lit-html-server --> <a href="www.google.com"><span enabled class="link"></span></a>'
      );
    });
    it('should return a stream when interpolating mixed attribute/text values', async () => {
      expect(
        normalizeWhitespace(
          await getStream(
            html`
              <a href="${'www.google.com'}">
                <span>${Promise.resolve('hi')}</span> <span ?enabled="${true}">${'there'}</span>
              </a>
            `
          )
        )
      ).to.equal('<a href="www.google.com"> <span>hi</span> <span enabled>there</span> </a>');
    });
    it('should throw when interpolating a non-primitive value', () => {
      let errored = false;
      try {
        html`
          <a href="${Promise.resolve()}"></a>
        `;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
  });
});
