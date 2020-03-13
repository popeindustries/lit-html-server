import { browserStreamTemplateRenderer } from './browser-stream-template-renderer';
import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { promiseTemplateRenderer } from './promise-template-renderer.js';
import { streamTemplateRenderer } from './node-stream-template-renderer.js';
import { Template } from './template.js';
import { TemplateResult } from './template-result.js';

export {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  NodePart,
  Part,
  PropertyAttributePart
} from './parts.js';
export {
  directive,
  isAttributePart,
  isDirective,
  isNodePart,
  nothing,
  unsafePrefixString
} from './shared.js';
export { isTemplateResult } from './is.js';
export {
  defaultTemplateProcessor,
  DefaultTemplateProcessor,
  defaultTemplateResultProcessor,
  DefaultTemplateResultProcessor,
  html,
  renderToBuffer,
  renderToStream,
  renderToString,
  html as svg,
  Template,
  templateCache,
  TemplateResult
};

const defaultTemplateProcessor = new DefaultTemplateProcessor();
const defaultTemplateResultProcessor = new DefaultTemplateResultProcessor();
const templateCache = new Map();
const streamRenderer =
  typeof process !== 'undefined' &&
  typeof process.versions !== 'undefined' &&
  typeof process.versions.node !== 'undefined'
    ? streamTemplateRenderer
    : browserStreamTemplateRenderer;

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
  return streamRenderer(result, defaultTemplateResultProcessor, options);
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
