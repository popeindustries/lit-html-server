/**
 * @typedef Readable { import('stream').Readable }
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
/**
 * @typedef RenderOptions
 * @property { boolean } [serializePropertyAttributes] - JSON.stringify property attributes
 */
import { isTemplateResult, templateResult } from './template-result.js';
import { DefaultTemplateProcessor } from './default-template-processor.js';
import { DefaultTemplateResultProcessor } from './default-template-result-processor.js';
import { PromiseTemplateRenderer } from './promise-template-renderer.js';
import { StreamTemplateRenderer } from './node-stream-template-renderer.js';
import { Template } from './template.js';

export {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  isAttributePart,
  isPropertyAttributePart,
  isNodePart,
  NodePart,
  Part,
  PropertyAttributePart
} from './parts.js';
export { nothingString, unsafePrefixString } from './string.js';
export { directive } from './directive.js';
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

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream or String
 *
 * @param { Array<TemplateStringsArray> } strings
 * @param  { ...unknown } values
 * @returns { TemplateResult }
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
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Readable }
 */
function renderToStream(result, options) {
  return new StreamTemplateRenderer(result, defaultTemplateResultProcessor, options);
}

/**
 * Render a template result to a string resolving Promise.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<string> }
 */
function renderToString(result, options) {
  return new PromiseTemplateRenderer(result, defaultTemplateResultProcessor, false, options);
}

/**
 * Render a template result to a Buffer resolving Promise.
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Promise<Buffer> }
 */
function renderToBuffer(result, options) {
  return new PromiseTemplateRenderer(result, defaultTemplateResultProcessor, true, options);
}
