interface TemplateProcessor {
  handleAttributeExpressions: (name: string, strings: TemplateStringsArray) => AttributePart;
  handleTextExpression: () => NodePart;
}

interface TemplateResultRenderer {
  push: (chunk: Buffer) => boolean;
  destroy: (err: Error) => void;
}

type RenderOptions = {
  serializePropertyAttributes: boolean;
};

export const defaultTemplateProcessor: DefaultTemplateProcessor;
export const defaultTemplateResultProcessor: DefaultTemplateResultProcessor;

/**
 * Define new directive for "fn".
 * The passed function should be a factory function,
 * and must return a function that will eventually be called with a Part instance
 */
export function directive<F extends (...args: Array<any>) => object>(f: F): F;

/**
 * Determine if "part" is an AttributePart
 */
export function isAttributePart(part: Part): boolean;

/**
 * Determine if "part" is a NodePart
 */
export function isNodePart(part: Part): boolean;

/**
 * Determine whether "result" is a TemplateResult
 */
export function isTemplateResult(result: TemplateResult): boolean;

/**
 * A value for strings that signals a Part to clear its content
 */
export const nothingString: string;
export const templateCache: Map<TemplateStringsArray, Template>;

/**
 * A prefix value for strings that should not be escaped
 */
export const unsafePrefixString: string;

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream or String
 */
export function html(strings: TemplateStringsArray, ...values: Array<unknown>): TemplateResult;
export function svg(strings: TemplateStringsArray, ...values: Array<unknown>): TemplateResult;

/**
 * Render a template result to a string resolving Promise.
 */
export function renderToString(result: TemplateResult, options?: RenderOptions): Promise<string>;

/**
 * Render a template result to a Readable stream
 */
export function renderToStream(
  result: TemplateResult,
  options?: RenderOptions
): import('stream').Readable;

/**
 * Render a template result to a Buffer resolving Promise.
 */
export function renderToBuffer(result: TemplateResult, options?: RenderOptions): Promise<Buffer>;

/**
 * Base class interface for Node/Attribute parts
 */
export class Part {
  /**
   * Store the current value.
   * Used by directives to temporarily transfer value
   * (value will be deleted after reading).
   */
  setValue(value: unknown): void;
}

/**
 * A dynamic template part for text nodes
 */
export class NodePart extends Part {
  /**
   * Retrieve resolved value given passed "value"
   */
  getValue(value: unknown, options?: RenderOptions): unknown;
}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 */
export class AttributePart extends Part {
  /*
   * @param { Array<any> } values
   * @returns { Buffer|Promise<Buffer> }
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}

/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
export class BooleanAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
export class PropertyAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Properties have no server-side representation,
   * so always returns an empty string.
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
export class EventAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}

/**
 * Class representing the default Template processor.
 * Exposes factory functions for generating Part instances to use for
 * resolving a template's dynamic values.
 */
export class DefaultTemplateProcessor {
  /**
   * Create part instance for dynamic attribute values
   */
  handleAttributeExpressions(name: string, strings?: Array<string>): AttributePart;

  /**
   * Create part instance for dynamic text values
   */
  handleTextExpression(): NodePart;
}

/**
 * Class for the default TemplateResult processor
 * used by Promise/Stream TemplateRenderers.
 *
 * @implements TemplateResultProcessor
 */
export class DefaultTemplateResultProcessor {
  /**
   * Process "stack" and push chunks to "renderer"
   */
  getProcessor(
    renderer: TemplateResultRenderer,
    stack: Array<unknown>,
    highWaterMark?: number,
    options?: RenderOptions
  ): () => void;

  /**
   * Permanently destroy all remaining TemplateResults in "stack".
   * (Triggered on error)
   */
  destroy(stack: Array<unknown>): void;
}

/**
 * A class for consuming the combined static and dynamic parts of a lit-html Template.
 * TemplateResults
 */
class TemplateResult {
  /**
   * Constructor
   */
  constructor(template: Template, values: Array<unknown>);

  /**
   * Consume template result content.
   */
  read(options?: RenderOptions): unknown;

  /**
   * Consume template result content one chunk at a time.
   */
  readChunk(options?: RenderOptions): unknown;
}

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
class Template {
  /**
   * Create Template instance
   */
  constructor(strings: Array<TemplateStringsArray>, processor: TemplateProcessor);

  /**
   * Prepare the template's static strings,
   * and create Part instances for the dynamic values,
   * based on lit-html syntax.
   */
  _prepare(strings: Array<TemplateStringsArray>, processor: TemplateProcessor): void;
}

declare module '@popeindustries/lit-html-server/directives/async-append.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const asyncAppend: (
    value: AsyncIterable<unknown>,
    mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined
  ) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/async-replace.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const asyncReplace: (
    value: AsyncIterable<unknown>,
    mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined
  ) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/cache.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const cache: (value: unknown) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/class-map.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const classMap: (classInfo: {
    [name: string]: string | boolean | number;
  }) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/guard.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const guard: (value: unknown, fn: () => unknown) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/if-defined.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const ifDefined: (value: unknown) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/repeat.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const repeat: (
    items: Array<unknown>,
    keyFnOrTemplate: (item: unknown, index: number) => unknown,
    template?: (item: unknown, index: number) => unknown
  ) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/style-map.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const styleMap: (styleInfo: { [name: string]: string }) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/unsafe-html.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const unsafeHTML: (value: unknown) => (part: Part) => void;
}

declare module '@popeindustries/lit-html-server/directives/until.js' {
  import { Part } from '@popeindustries/lit-html-server';

  export const until: (...args: Array<unknown>) => (part: Part) => void;
}
