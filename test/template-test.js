import { DefaultTemplateProcessor } from '../src/default-template-processor.js';
import { expect } from 'chai';
import { Part } from '../src/parts.js';
import { Template } from '../src/template.js';

const defaultTemplateProcessor = new DefaultTemplateProcessor();

describe('Template', () => {
  it('should prepare a plain text template', () => {
    const template = new Template(['text'], defaultTemplateProcessor);
    expect(template.strings).to.eql(['text']);
  });
  it('should prepare a template with value', () => {
    const template = new Template(['', ''], defaultTemplateProcessor);
    expect(template.strings).to.have.length(2);
    expect(template.strings[0]).to.equal('');
    expect(template.strings[1]).to.equal('');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
  });
  it('should prepare a template with quoted attribute', () => {
    const template = new Template(['<div a="', '"></div>'], defaultTemplateProcessor);
    expect(template.strings[0]).to.equal('<div ');
    expect(template.strings[1]).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
  });
  it('should prepare a template with quoted attribute and extra whitespace', () => {
    const template = new Template(['<div a = " ', ' "></div>'], defaultTemplateProcessor);
    expect(template.strings[0]).to.equal('<div ');
    expect(template.strings[1]).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
    expect(template.parts[0].strings).to.eql([' ', ' ']);
  });
  it('should prepare a template with quoted attribute and extra strings', () => {
    const template = new Template(['<div a="some ', ' here"></div>'], defaultTemplateProcessor);
    expect(template.strings[0]).to.equal('<div ');
    expect(template.strings[1]).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
    expect(template.parts[0].strings).to.eql(['some ', ' here']);
    expect(template.parts[0]).to.have.length(1);
  });
  it('should prepare a template with quoted attribute and multiple strings/values', () => {
    const template = new Template(['<div a="', ' in ', '"></div>'], defaultTemplateProcessor);
    expect(template.strings[0]).to.equal('<div ');
    expect(template.strings[1]).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
    expect(template.parts[0].strings).to.eql(['', ' in ', '']);
    expect(template.parts[0]).to.have.length(2);
  });
  it('should prepare a template with boolean attribute', () => {
    const template = new Template(['<div ?a="', '"></div>'], defaultTemplateProcessor);
    expect(template.strings[0]).to.equal('<div ');
    expect(template.strings[1]).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
  });
  it('should prepare a template with event attribute', () => {
    const template = new Template(['<div @a="some handler ', '"></div>'], defaultTemplateProcessor);
    expect(template.strings[0]).to.equal('<div ');
    expect(template.strings[1]).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(Part);
  });
});
