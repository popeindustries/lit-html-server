import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { promiseTemplateRenderer } from './promise-template-renderer.js';
import { streamTemplateRenderer } from './stream-template-renderer.js';
import { Template } from './template.js';
import { templateResult } from './template-result.js';

export { directive } from './directive.js';
export { AttributePart, NodePart, nothing, unsafeStringPrefix } from './parts.js';
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
 * @param {Array<string>} strings
 * @param  {...any} values
 * @returns {Array}
 */
function html(strings, ...values) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new Template(strings, defaultTemplateProcessor);
    templateCache.set(strings, template);
  }

  return templateResult(template, values, defaultTemplateResultProcessor);
}

/**
 * Render a template result to a Readable stream
 * @param {Array} result
 * @param {object} [options] stream.Readable options
 * @returns {Readable}
 */
function renderToStream(result, options) {
  return streamTemplateRenderer(result, options);
}

/**
 * Render a template result to a string resolving Promise
 * @param {Array} result
 * @returns {Promise<string>}
 */
function renderToString(result) {
  return promiseTemplateRenderer(result);
}
