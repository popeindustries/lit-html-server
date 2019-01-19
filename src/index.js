import { DefaultTemplateProcessor } from './default-template-processor.js';
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
function renderToString(/* result */) {}
