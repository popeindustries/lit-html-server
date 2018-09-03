'use strict';

const { expect } = require('chai');
const getStream = require('get-stream');
const htmlTemplate = require('../lib/htmlTemplate.js');

describe('htmlTemplate()', () => {
  describe('text mode', () => {
    it('should return a string when interpolating primitive values', () => {
      expect(htmlTemplate`hello ${'foo'}, you are ${2} right ${true}`).to.equal(
        '<!-- lit-html-server -->hello foo, you are 2 right true'
      );
    });
    it('should return a string when interpolating primitive values and nested templates', () => {
      expect(htmlTemplate`hello ${htmlTemplate`${'foo'}`}, you are ${2} right ${true}`).to.equal(
        '<!-- lit-html-server -->hello foo, you are 2 right true'
      );
    });
    it('should return a string when interpolating null values', () => {
      expect(htmlTemplate`hello ${null}, you are ${undefined} right ${true}`).to.equal(
        '<!-- lit-html-server -->hello null, you are  right true'
      );
    });
    it('should return a string when interpolating Array values', () => {
      expect(htmlTemplate`hello ${[1, 2, 3]}`).to.equal('<!-- lit-html-server -->hello 123');
    });
    it('should return a string when interpolating sync iterator values', () => {
      expect(htmlTemplate`hello ${new Set([1, 2, 3])}`).to.equal(
        '<!-- lit-html-server -->hello 123'
      );
    });
    it('should return a stream when using Promise values', async () => {
      expect(await getStream(htmlTemplate`hello ${Promise.resolve('foo')}`)).to.equal('hello foo');
    });
    it('should return a stream when nesting templates using Promise values', async () => {
      expect(
        await getStream(htmlTemplate`hello ${htmlTemplate`${Promise.resolve('foo')}`}`)
      ).to.equal('hello foo');
    });
  });

  describe('attribute mode', () => {
    it('should return a string when interpolating element attribute values', () => {
      expect(htmlTemplate`<a href="${'www.nrk.no'}" something="${undefined}">`).to.equal(
        '<!-- lit-html-server --><a href="www.nrk.no" something="undefined">'
      );
    });
    it('should return a string when interpolating multi-part element attribute values', () => {
      expect(htmlTemplate`<a class="${'one'}-${'two'}">`).to.equal(
        '<!-- lit-html-server --><a class="one-two">'
      );
    });
    it('should return a string with attribute when interpolating truthy boolean attribute bindings', () => {
      expect(htmlTemplate`<a ?enabled=${true}>`).to.equal('<!-- lit-html-server --><a enabled>');
      expect(htmlTemplate`<a ?enabled="${true}">`).to.equal('<!-- lit-html-server --><a enabled>');
    });
    it('should return a string without attribute when interpolating falsy boolean attribute bindings', () => {
      expect(htmlTemplate`<a ?enabled=${false}>`).to.equal('<!-- lit-html-server --><a >');
      expect(htmlTemplate`<a ?enabled="${false}">`).to.equal('<!-- lit-html-server --><a >');
    });
    it('should return a string without attribute when interpolating property attribute bindings', () => {
      expect(htmlTemplate`<a .enabled=${false}>`).to.equal('<!-- lit-html-server --><a >');
      expect(htmlTemplate`<a .enabled="${false}">`).to.equal('<!-- lit-html-server --><a >');
    });
    it('should return a string without attribute when interpolating event handler attribute bindings', () => {
      expect(htmlTemplate`<a @click=${(evt) => console.log(evt)}>`).to.equal(
        '<!-- lit-html-server --><a >'
      );
      expect(htmlTemplate`<a @click="${(evt) => console.log(evt)}">`).to.equal(
        '<!-- lit-html-server --><a >'
      );
    });
    it('should return a string with quoted attribute when interpolating element attribute value missing quotes', () => {
      expect(htmlTemplate`<a href=${'www.nrk.no'}>`).to.equal(
        '<!-- lit-html-server --><a href="www.nrk.no">'
      );
    });
    it('should return a string when interpolating multiple attribute values', () => {
      expect(
        htmlTemplate`<a href="${'www.nrk.no'}" ?enabled=${true} class="link ${'one'} ${'two'}"></a>`
      ).to.equal('<!-- lit-html-server --><a href="www.nrk.no" enabled class="link one two"></a>');
    });
    it('should return a string when interpolating multiple attribute values in different elements', () => {
      expect(
        htmlTemplate`<a href="${'www.nrk.no'}"><span ?enabled=${true} class="link"></span></a>`
      ).to.equal(
        '<!-- lit-html-server --><a href="www.nrk.no"><span enabled class="link"></span></a>'
      );
    });
    it('should return a stream when interpolating mixed attribute/text values', async () => {
      expect(
        await getStream(
          htmlTemplate`<a href="${'www.nrk.no'}"><span>${Promise.resolve(
            'hi'
          )}</span> <span ?enabled=${true}>${'there'}</span></a>`
        )
      ).to.equal('<a href="www.nrk.no"><span>hi</span> <span enabled>there</span></a>');
    });
    it('should throw when interpolating a non-primitive value', () => {
      let errored = false;
      try {
        htmlTemplate`<a href="${Promise.resolve()}">`;
      } catch (err) {
        expect(err).to.exist;
        errored = true;
      }
      expect(errored).to.equal(true);
    });
  });
});
