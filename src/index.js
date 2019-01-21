import { DefaultTemplateProcessor } from './default-template-processor.js';
import { promiseTemplateRenderer } from './promise-template-renderer.js';
import { streamTemplateRenderer } from './stream-template-renderer.js';
import { Template } from './template.js';
import { templateResult } from './template-result.js';

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
 * @returns {Array}
 */
function html(strings, ...values) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new Template(strings, defaultTemplateProcessor);
    templateCache.set(strings, template);
  }

  return templateResult(template, values);
}

/**
 * Render a template result to a Readable stream
 * @param {Array} result
 * @returns {Readable}
 */
function renderToStream(result) {
  return streamTemplateRenderer(result);
}

/**
 * Render a template result to a string resolving Promise
 * @param {Array} result
 * @returns {Promise<string>}
 */
function renderToString(result) {
  return promiseTemplateRenderer(result);
}
