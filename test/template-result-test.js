import { DefaultTemplateProcessor } from '../src/default-template-processor.js';
import { expect } from 'chai';
import { Part } from '../src/parts.js';
import { TemplateResult } from '../src/template-result.js';

const defaultTemplateProcessor = new DefaultTemplateProcessor();

describe.only('TemplateResult', () => {
  it('should prepare a plain text template', () => {
    const template = new TemplateResult(['text'], [], 'html', defaultTemplateProcessor);
    expect(template.content).to.eql(['text']);
  });
  it('should prepare a template with value', () => {
    const template = new TemplateResult(['', ''], ['text'], 'html', defaultTemplateProcessor);
    expect(template.content).to.have.length(3);
    expect(template.content[0]).to.equal('');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[2]).to.equal('');
  });
  it('should prepare a template with quoted attribute', () => {
    const template = new TemplateResult(
      ['<div a="', '"></div>'],
      ['text'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.content[0]).to.equal('<div ');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[2]).to.equal('></div>');
  });
  it('should prepare a template with quoted attribute and extra whitespace', () => {
    const template = new TemplateResult(
      ['<div a = " ', ' "></div>'],
      ['text'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.content[0]).to.equal('<div ');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[1].strings).to.eql([' ', ' ']);
    expect(template.content[2]).to.equal('></div>');
  });
  it('should prepare a template with quoted attribute and extra strings', () => {
    const template = new TemplateResult(
      ['<div a="some ', ' here"></div>'],
      ['text'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.content[0]).to.equal('<div ');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[1].strings).to.eql(['some ', ' here']);
    expect(template.content[1]).to.have.length(1);
    expect(template.content[2]).to.equal('></div>');
  });
  it('should prepare a template with quoted attribute and multiple strings/values', () => {
    const template = new TemplateResult(
      ['<div a="', ' in ', '"></div>'],
      ['text', 'here'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.content[0]).to.equal('<div ');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[1].strings).to.eql(['', ' in ', '']);
    expect(template.content[1]).to.have.length(2);
    expect(template.content[2]).to.equal('></div>');
  });
  it('should prepare a template with boolean attribute', () => {
    const template = new TemplateResult(
      ['<div ?a="', '"></div>'],
      [true],
      'html',
      defaultTemplateProcessor
    );
    expect(template.content[0]).to.equal('<div ');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[2]).to.equal('></div>');
  });
  it('should prepare a template with event attribute', () => {
    const template = new TemplateResult(
      ['<div @a="some handler ', '"></div>'],
      ['fn'],
      'html',
      defaultTemplateProcessor
    );
    expect(template.content[0]).to.equal('<div ');
    expect(template.content[1]).to.be.an.instanceOf(Part);
    expect(template.content[2]).to.equal('></div>');
  });
});
