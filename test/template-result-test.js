import { DefaultTemplateProcessor } from '../src/default-template-processor.js';
import { expect } from 'chai';
import { Part } from '../src/parts.js';
import { TemplateResult } from '../src/template-result.js';

const defaultTemplateProcessor = new DefaultTemplateProcessor();

describe.only('TemplateResult', () => {
  it('should prepare a plain text template', () => {
    const template = new TemplateResult(['text'], [], 'html', defaultTemplateProcessor);
    expect(template.stringsAndParts).to.eql(['text']);
  });
  it('should prepare a template with value', () => {
    const template = new TemplateResult(['', ''], ['text'], 'html', defaultTemplateProcessor);
    expect(template.stringsAndParts).to.have.length(3);
    expect(template.stringsAndParts[0]).to.equal('');
    expect(template.stringsAndParts[1]).to.be.an.instanceOf(Part);
    expect(template.stringsAndParts[2]).to.equal('');
  });
  it('should prepare a template with quoted attribute', () => {
    const template = new TemplateResult(
      ['<div a="', '"></div>'],
      ['text'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.stringsAndParts[0]).to.equal('<div ');
    expect(template.stringsAndParts[1]).to.be.an.instanceOf(Part);
    expect(template.stringsAndParts[1].strings).to.have.length(
      template.stringsAndParts[1].value.length + 1
    );
    expect(template.stringsAndParts[2]).to.equal('></div>');
  });
  it('should prepare a template with quoted attribute and extra whitespace', () => {
    const template = new TemplateResult(
      ['<div a = " ', ' "></div>'],
      ['text'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.stringsAndParts[0]).to.equal('<div ');
    expect(template.stringsAndParts[1]).to.be.an.instanceOf(Part);
    expect(template.stringsAndParts[1].strings).to.eql([' ', ' ']);
    expect(template.stringsAndParts[1].strings).to.have.length(
      template.stringsAndParts[1].value.length + 1
    );
    expect(template.stringsAndParts[2]).to.equal('></div>');
  });
  it('should prepare a template with quoted attribute and extra strings', () => {
    const template = new TemplateResult(
      ['<div a="some ', ' here"></div>'],
      ['text'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.stringsAndParts[0]).to.equal('<div ');
    expect(template.stringsAndParts[1]).to.be.an.instanceOf(Part);
    expect(template.stringsAndParts[1].strings).to.eql(['some ', ' here']);
    expect(template.stringsAndParts[1].strings).to.have.length(
      template.stringsAndParts[1].value.length + 1
    );
    expect(template.stringsAndParts[2]).to.equal('></div>');
  });
  it('should prepare a template with quoted attribute and multiple strings/values', () => {
    const template = new TemplateResult(
      ['<div a="', ' in ', '"></div>'],
      ['text', 'here'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.stringsAndParts[0]).to.equal('<div ');
    expect(template.stringsAndParts[1]).to.be.an.instanceOf(Part);
    expect(template.stringsAndParts[1].strings).to.eql(['', ' in ', '']);
    expect(template.stringsAndParts[1].strings).to.have.length(
      template.stringsAndParts[1].value.length + 1
    );
    expect(template.stringsAndParts[2]).to.equal('></div>');
  });
});
