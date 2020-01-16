import { isTemplateResult, TemplateResult } from './template-result.js';
import { browserStreamTemplateRenderer } from './browser-stream-template-renderer';
import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { polyfillBuffer } from './browser-buffer-polyfill.js';
import { promiseTemplateRenderer } from './promise-template-renderer.js';
import { streamTemplateRenderer } from './node-stream-template-renderer.js';
import { Template } from './template.js';

export {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  isAttributePart,
  isNodePart,
  NodePart,
  Part,
  PropertyAttributePart
} from './parts.js';
export { nothingString, unsafePrefixString } from './string.js';
export { directive, isDirective } from './directive.js';
export {
  defaultTemplateProcessor,
  defaultTemplateResultProcessor,
  html,
  isTemplateResult,
  renderToBuffer,
  renderToStream,
  renderToString,
  html as svg,
  templateCache
};

const defaultTemplateProcessor = new DefaultTemplateProcessor();
const defaultTemplateResultProcessor = new DefaultTemplateResultProcessor();
const templateCache = new Map();
const isNode = typeof process !== 'undefined' && typeof process.versions.node !== 'undefined';

if (!isNode) {
  polyfillBuffer();
}

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
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { import('stream').Readable | ReadableStream }
 */
function renderToStream(result, options) {
  return isNode
    ? streamTemplateRenderer(result, defaultTemplateResultProcessor, options)
    : browserStreamTemplateRenderer(result, defaultTemplateResultProcessor, options);
}

/**
 * Render a template result to a string resolving Promise.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<string> }
 */
function renderToString(result, options) {
  return promiseTemplateRenderer(result, defaultTemplateResultProcessor, false, options);
}

/**
 * Render a template result to a Buffer resolving Promise.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<Buffer> }
 */
function renderToBuffer(result, options) {
  return promiseTemplateRenderer(result, defaultTemplateResultProcessor, true, options);
}
