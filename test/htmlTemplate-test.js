const { expect } = require('chai');
const getStream = require('get-stream');
const htmlTemplate = require('../lib/htmlTemplate.js');

describe.only('htmlTemplate()', () => {
  describe('text mode', () => {
    it('should return a string when interpolating primitive values', () => {
      expect(htmlTemplate`hello ${'foo'}, you are ${2} right ${true}`).to.equal(
        'hello foo, you are 2 right true'
      );
    });
    it('should return a string when interpolating primitive values and nested templates', () => {
      expect(htmlTemplate`hello ${htmlTemplate`${'foo'}`}, you are ${2} right ${true}`).to.equal(
        'hello foo, you are 2 right true'
      );
    });
    it('should return a stream when using Promise interpolation types', async () => {
      expect(await getStream(htmlTemplate`hello ${Promise.resolve('foo')}`)).to.equal('hello foo');
    });
    it('should return a stream when nesting templates using Promise interpolation types', async () => {
      expect(
        await getStream(htmlTemplate`hello ${htmlTemplate`${Promise.resolve('foo')}`}`)
      ).to.equal('hello foo');
    });
    it('should return a stream when using Buffer interpolation types', async () => {
      expect(await getStream(htmlTemplate`hello ${Buffer.from('foo')}`)).to.equal('hello foo');
    });
    it('should return a stream when nesting templates using Buffer interpolation types', async () => {
      expect(await getStream(htmlTemplate`hello ${htmlTemplate`${Buffer.from('foo')}`}`)).to.equal(
        'hello foo'
      );
    });
  });

  describe('attribute mode', () => {
    it('should return a string when interpolating element attribute values', () => {
      expect(htmlTemplate`<a href="${'www.nrk.no'}">`).to.equal('<a href="www.nrk.no">');
    });
    it('should return a string when interpolating element tag name', () => {
      expect(htmlTemplate`<${'a'} href="www.nrk.no">`).to.equal('<a href="www.nrk.no">');
    });
    it('should return a string with attribute when interpolating special truthy boolean attribute values', () => {
      expect(htmlTemplate`<a ?enabled=${true}>`).to.equal('<a enabled>');
      expect(htmlTemplate`<a ?enabled="${true}">`).to.equal('<a enabled>');
    });
    it('should return a string without attribute when interpolating special falsy boolean attribute values', () => {
      expect(htmlTemplate`<a ?enabled=${false}>`).to.equal('<a >');
      expect(htmlTemplate`<a ?enabled="${false}">`).to.equal('<a >');
    });
    it('should return a string without attribute when interpolating special property attribute values', () => {
      expect(htmlTemplate`<a .enabled=${false}>`).to.equal('<a >');
      expect(htmlTemplate`<a .enabled="${false}">`).to.equal('<a >');
    });
    it('should return a string without attribute when interpolating special event handler attribute values', () => {
      expect(htmlTemplate`<a @click=${(evt) => console.log(evt)}>`).to.equal('<a >');
      expect(htmlTemplate`<a @click="${(evt) => console.log(evt)}">`).to.equal('<a >');
    });
    it('should return a string with quoted attribute when interpolating element attribute value missing quotes', () => {
      expect(htmlTemplate`<a href=${'www.nrk.no'}>`).to.equal('<a href="www.nrk.no">');
    });
    it('should return a string when interpolating multiple attribute values', () => {
      expect(htmlTemplate`<a href="${'www.nrk.no'}" ?enabled=${true} class="link"></a>`).to.equal(
        '<a href="www.nrk.no" enabled class="link"></a>'
      );
    });
    it('should return a string when interpolating multiple attribute values in different elements', () => {
      expect(
        htmlTemplate`<a href="${'www.nrk.no'}"><span ?enabled=${true} class="link"></span></a>`
      ).to.equal('<a href="www.nrk.no"><span enabled class="link"></span></a>');
    });
    it('should return a string when interpolating mixed attribute/text values', async () => {
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
