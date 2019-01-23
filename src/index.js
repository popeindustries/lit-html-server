/**
 * @typedef Readable { import('stream').Readable }
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { PromiseTemplateRenderer } from './promise-template-renderer.js';
import { StreamTemplateRenderer } from './stream-template-renderer.js';
import { Template } from './template.js';
import { TemplateResult } from './template-result.js';

export { directive } from './directive.js';
export { AttributePart, NodePart, nothingString, unsafeStringPrefix } from './parts.js';
export {
  defaultTemplateProcessor,
  defaultTemplateResultProcessor,
  html,
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
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { object } [options] - Readable stream options
 * @see https://nodejs.org/api/stream.html#stream_new_stream_readable_options
 * @returns { Readable }
 */
function renderToStream(result, options) {
  return new StreamTemplateRenderer(result, options);
}

/**
 * Render a template result to a string resolving Promise
 *
 * @param { TemplateResult } result
 * @returns { Promise<string> }
 */
function renderToString(result) {
  return new PromiseTemplateRenderer(result);
}
