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
 * html`<el a="t${'e'}x${'t'}s">`
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
 * html`<el a="text ${directive()}">`
 * html`<el .p="${directive()}">`
 */

import { DefaultTemplateProcessor } from './default-template-processor.js';
import { promiseTemplateRenderer } from './promise-template-renderer.js';
import { Template } from './template.js';
import { TemplateResult } from './template-result.js';

export {
  defaultTemplateProcessor,
  html,
  renderToStream,
  renderToString,
  html as svg,
  templateCache
};

const defaultTemplateProcessor = new DefaultTemplateProcessor();
const templateCache = new Map();

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream or String
 * @param {Array<string>} strings
 * @param  {...any} values
 * @returns {TemplateResult}
 */
function html(strings, ...values) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new Template(strings, defaultTemplateProcessor);
    templateCache.set(strings, template);
  }

  return new TemplateResult(template, values);
}

/**
 * Renders a template to a Readable stream
 * @param {TemplateResult} result
 * @returns {Readable}
 */
function renderToStream(/* result */) {}

/**
 * Renders a template to a String resolving Promise
 * @param {TemplateResult} result
 * @returns {Promise<string>}
 */
function renderToString(result) {
  return promiseTemplateRenderer(result);
}
