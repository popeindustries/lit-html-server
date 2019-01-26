/**
 * @typedef Readable { import('stream').Readable }
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { isTemplateResult, TemplateResult } from './template-result.js';
import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { PromiseTemplateRenderer } from './promise-template-renderer.js';
import { StreamTemplateRenderer } from './stream-template-renderer.js';
import { Template } from './template.js';

export { AttributePart, NodePart, nothingString, unsafeStringPrefix } from './parts.js';
export { directive } from './directive.js';
export {
  defaultTemplateProcessor,
  defaultTemplateResultProcessor,
  html,
  isTemplateResult,
  renderToStream,
  renderToString,
  html as svg,
  templateCache
};

const defaultTemplateProcessor = new DefaultTemplateProcessor();
const defaultTemplateResultProcessor = new DefaultTemplateResultProcessor();
const templateCache = new Map();

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream or String
 *
 * @param { Array<string> } strings
 * @param  { ...any } values
 * @returns { TemplateResult }
 */
function html(strings, ...values) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new Template(strings, defaultTemplateProcessor);
    templateCache.set(strings, template);
  }

  return TemplateResult(template, values, defaultTemplateResultProcessor);
}

/**
 * Render a template result to a Readable stream
 * Note that, by default, the "result" will be emptied of elements during render,
 * and should be considered single use.
 * Set "options.destructive = false" to allow for reuse.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { object } [options]
 * @param { object } [options.destructive = true] - destroy "result" while rendering ("true"), or operate on a shallow copy ("false")
 * @returns { Readable }
 */
function renderToStream(result, options) {
  return new StreamTemplateRenderer(result, options);
}

/**
 * Render a template result to a string resolving Promise.
 * Note that, by default, the "result" will be emptied of elements during render,
 * and should be considered single use.
 * Set "options.destructive = false" to allow for reuse.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { object } [options]
 * @param { object } [options.destructive = true] - destroy "result" while rendering ("true"), or operate on a shallow copy ("false")
 * @returns { Promise<string> }
 */
function renderToString(result, options) {
  return new PromiseTemplateRenderer(result, options);
}
