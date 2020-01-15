import { isTemplateResult, TemplateResult } from './template-result.js';
import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { promiseTemplateRenderer } from './promise-template-renderer.js';
import { streamTemplateRenderer } from './browser-stream-template-renderer.js';
import { Template } from './template.js';

export { isAttributePart, isNodePart } from './parts.js';
export { nothingString, unsafePrefixString } from './string.js';
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
 * @param { TemplateStringsArray } strings
 * @param  { ...unknown } values
 * @returns { TemplateResult }
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
 * Render a template result to a Readable stream
 * *Note* that TemplateResults are single use, and can only be rendered once.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @returns { ReadableStream }
 */
function renderToStream(result) {
  return streamTemplateRenderer(result, defaultTemplateResultProcessor);
}

/**
 * Render a template result to a string resolving Promise.
 * *Note* that TemplateResults are single use, and can only be rendered once.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @returns { Promise<string> }
 */
function renderToString(result) {
  return promiseTemplateRenderer(result, defaultTemplateResultProcessor, false);
}
