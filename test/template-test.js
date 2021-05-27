import { AttributePart, ChildPart, Template } from '../src/index.js';
import { expect } from 'chai';

describe('Template', () => {
  it('should prepare a plain text template', () => {
    const template = new Template(['text']);
    expect(template.strings.map((s) => s.toString())).to.deep.equal(['text']);
  });
  it('should prepare a template with value', () => {
    const template = new Template(['', '']);
    expect(template.strings).to.have.length(2);
    expect(template.strings[0].toString()).to.equal('');
    expect(template.strings[1].toString()).to.equal('');
    expect(template.parts[0]).to.be.an.instanceOf(ChildPart);
  });
  it('should prepare a template with quoted attribute', () => {
    const template = new Template(['<div a="', '"></div>']);
    expect(template.strings[0].toString()).to.equal('<div ');
    expect(template.strings[1].toString()).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(AttributePart);
  });
  it('should prepare a template with quoted attribute and extra whitespace', () => {
    const template = new Template(['<div a = " ', ' "></div>']);
    expect(template.strings[0].toString()).to.equal('<div ');
    expect(template.strings[1].toString()).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(AttributePart);
    expect(template.parts[0].strings.map((s) => s.toString())).to.deep.equal([' ', ' ']);
  });
  it('should prepare a template with quoted attribute and extra strings', () => {
    const template = new Template(['<div a="some ', ' here"></div>']);
    expect(template.strings[0].toString()).to.equal('<div ');
    expect(template.strings[1].toString()).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(AttributePart);
    expect(template.parts[0].strings.map((s) => s.toString())).to.deep.equal(['some ', ' here']);
    expect(template.parts[0]).to.have.length(1);
  });
  it('should prepare a template with quoted attribute and multiple strings/values', () => {
    const template = new Template(['<div a="', ' in ', '">', '</div>']);
    expect(template.strings[0].toString()).to.equal('<div ');
    expect(template.strings[1]).to.equal(null);
    expect(template.strings[2].toString()).to.equal('>');
    expect(template.strings[3].toString()).to.equal('</div>');
    expect(template.parts[0]).to.be.an.instanceOf(AttributePart);
    expect(template.parts[0].strings.map((s) => s.toString())).to.deep.equal(['', ' in ', '']);
    expect(template.parts[0]).to.have.length(2);
    expect(template.parts[1]).to.equal(null);
    expect(template.parts[2]).to.be.an.instanceOf(ChildPart);
  });
  it('should prepare a template with boolean attribute', () => {
    const template = new Template(['<div ?a="', '"></div>']);
    expect(template.strings[0].toString()).to.equal('<div ');
    expect(template.strings[1].toString()).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(AttributePart);
  });
  it('should prepare a template with event attribute', () => {
    const template = new Template(['<div @a="some handler ', '"></div>']);
    expect(template.strings[0].toString()).to.equal('<div ');
    expect(template.strings[1].toString()).to.equal('></div>');
    expect(template.parts[0]).to.be.an.instanceOf(AttributePart);
  });
  it('should prepare a template with text part tag names', () => {
    const template = new Template(['<div>', '</div>']);
    expect(template.parts[0].tagName).to.equal('div');
  });
  it('should prepare a template with attribute parts tag names', () => {
    const template = new Template(['<div a="', '"></div>']);
    expect(template.parts[0].tagName).to.equal('div');
  });
  it('should prepare a template with multiple nested parts tag names', () => {
    const template = new Template(['<div a="', '"><span b="', '"</span></div>']);
    expect(template.parts[0].tagName).to.equal('div');
    expect(template.parts[1].tagName).to.equal('span');
  });
});
