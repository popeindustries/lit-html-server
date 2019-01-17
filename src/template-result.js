/**
 * html`text`
 * html`${'text'}`
 * html`${123}`
 * html`${undefined}`
 * html`${null}`
 * html`${value}`
 * html`${[1,2,3]}`
 * html`${html`text`} text`
 * html`${'text'} ${'text'}`
 * html`${[1,2,3].map((i) => html`${i}`)}`
 *
 * html`<el a="${'text'}">`
 * html`<el a="t${'e'}x${'t'}">`
 * html`<el a="${value} b="${value}">`
 * html`<el style="prop: ${value}">`
 * html`<el style="${prop}: ${value}">`
 * html`<el a=${'text'}>`
 * html`<el a="b=${'value'}">`
 * html`<el a=${[1,2,3]}>`
 * html`<el a=${undefined}>`
 * html`<el .p=${123}>`
 * html`<el ?b="${value}">`
 * html`<el @e=${value}>`
 *
 * html`${directive()}`
 * html`<el a="${directive()}">`
 * html`<el .p="${directive()}">`
 */

export class TemplateResult {
  constructor(strings, values, type, processor) {
    this.strings = strings;
    this.values = values;
    this.type = type;
    this.processor = processor;
  }
}
