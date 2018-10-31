'use strict';

const asyncHtmlTemplate = require('../lib/streamHtmlTemplate.js');
const { expect } = require('chai');
const getStream = require('get-stream');
const html = require('../lib/htmlTemplate.js')(asyncHtmlTemplate);

describe('html()', () => {
  describe('text mode', () => {
    it('should return a string when interpolating primitive values', () => {
      expect(html`hello ${'foo'}, you are ${2} right ${true}`).to.equal(
        '<!-- lit-html-server -->hello foo, you are 2 right true'
      );
    });
    it('should return a string when interpolating primitive values and nested templates', () => {
      expect(html`hello ${html`${'foo'}`}, you are ${2} right ${true}`).to.equal(
        '<!-- lit-html-server -->hello foo, you are 2 right true'
      );
    });
    it('should return a string when interpolating null values', () => {
      expect(html`hello ${null}, you are ${undefined} right ${true}`).to.equal(
        '<!-- lit-html-server -->hello null, you are  right true'
      );
    });
    it('should return a string when interpolating Array values', () => {
      expect(html`hello ${[1, 2, 3]}`).to.equal('<!-- lit-html-server -->hello 123');
    });
    it('should return a string when interpolating sync iterator values', () => {
      expect(html`hello ${new Set([1, 2, 3])}`).to.equal('<!-- lit-html-server -->hello 123');
    });
    it('should return a stream when using Promise values', async () => {
      expect(await getStream(html`hello ${Promise.resolve('foo')}`)).to.equal('hello foo');
    });
    it('should return a stream when nesting templates using Promise values', async () => {
      expect(await getStream(html`hello ${html`${Promise.resolve('foo')}`}`)).to.equal('hello foo');
    });
  });

  describe('attribute mode', () => {
    it('should return a string when interpolating element attribute values', () => {
      expect(html`<a href="${'www.google.com'}" something="${undefined}">`).to.equal(
        '<!-- lit-html-server --><a href="www.google.com" something="undefined">'
      );
    });
    it('should return a string when interpolating multi-part element attribute values', () => {
      expect(html`<a class="${'one'}-${'two'}">`).to.equal(
        '<!-- lit-html-server --><a class="one-two">'
      );
    });
    it('should return a string with attribute when interpolating truthy boolean attribute bindings', () => {
      expect(html`<a ?enabled=${true}>`).to.equal('<!-- lit-html-server --><a enabled>');
      expect(html`<a ?enabled="${true}">`).to.equal('<!-- lit-html-server --><a enabled>');
    });
    it('should return a string without attribute when interpolating falsy boolean attribute bindings', () => {
      expect(html`<a ?enabled=${false}>`).to.equal('<!-- lit-html-server --><a >');
      expect(html`<a ?enabled="${false}">`).to.equal('<!-- lit-html-server --><a >');
    });
    it('should return a string without attribute when interpolating property attribute bindings', () => {
      expect(html`<a .enabled=${false}>`).to.equal('<!-- lit-html-server --><a >');
      expect(html`<a .enabled="${false}">`).to.equal('<!-- lit-html-server --><a >');
    });
    it('should return a string without attribute when interpolating event handler attribute bindings', () => {
      expect(html`<a @click=${(evt) => console.log(evt)}>`).to.equal(
        '<!-- lit-html-server --><a >'
      );
      expect(html`<a @click="${(evt) => console.log(evt)}">`).to.equal(
        '<!-- lit-html-server --><a >'
      );
    });
    it('should return a string with quoted attribute when interpolating element attribute value missing quotes', () => {
      expect(html`<a href=${'www.google.com'}>`).to.equal(
        '<!-- lit-html-server --><a href="www.google.com">'
      );
    });
    it('should return a string when interpolating multiple attribute values', () => {
      expect(
        html`<a href="${'www.google.com'}" ?enabled=${true} class="link ${'one'} ${'two'}"></a>`
      ).to.equal(
        '<!-- lit-html-server --><a href="www.google.com" enabled class="link one two"></a>'
      );
    });
    it('should return a string when interpolating multiple attribute values in different elements', () => {
      expect(
        html`<a href="${'www.google.com'}"><span ?enabled=${true} class="link"></span></a>`
      ).to.equal(
        '<!-- lit-html-server --><a href="www.google.com"><span enabled class="link"></span></a>'
      );
    });
    it('should return a stream when interpolating mixed attribute/text values', async () => {
      expect(
        await getStream(
          html`<a href="${'www.google.com'}"><span>${Promise.resolve(
            'hi'
          )}</span> <span ?enabled=${true}>${'there'}</span></a>`
        )
      ).to.equal('<a href="www.google.com"><span>hi</span> <span enabled>there</span></a>');
    });
    it('should throw when interpolating a non-primitive value', () => {
      let errored = false;
      try {
        html`<a href="${Promise.resolve()}">`;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
  });
});
