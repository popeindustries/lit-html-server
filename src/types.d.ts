interface TemplateResultProcessor {
  /**
   * Process "stack" and push chunks to "renderer"
   */
  getProcessor(
    renderer: TemplateResultRenderer,
    stack: Array<unknown>,
    highWaterMark?: number,
    options?: RenderOptions,
  ): () => void;

  /**
   * Permanently destroy all remaining TemplateResults in "stack".
   * (Triggered on error)
   */
  destroy(stack: Array<unknown>): void;
}

interface TemplateResultRenderer {
  push: (chunk: Buffer | null) => boolean;
  destroy: (err: Error) => void;
}

/**
 * Base class interface for Node/Attribute parts
 */
/* export */ declare class Part {
  tagName: string;
  _value: unknown;

  constructor(tagName: string);

  /**
   * Store the current value.
   * Used by directives to temporarily transfer value
   * (value will be deleted after reading).
   */
  setValue(value: unknown): void;

  /**
   * Retrieve resolved string from passed "value"
   */
  getValue(value: unknown, options?: RenderOptions): unknown;

  /**
   * No-op
   */
  commit(): void;
}

/**
 * A dynamic template part for text nodes
 */
/* export */ declare class ChildPart extends Part {}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 */
/* export */ declare class AttributePart extends Part {
  name: string;
  strings: Array<Buffer>;
  length: number;
  prefix: Buffer;
  suffix: Buffer;

  constructor(name: string, strings: Array<Buffer>, tagName: string);

  /*
   * Retrieve resolved string from passed "value"
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}

/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
/* export */ declare class BooleanAttributePart extends AttributePart {
  nameAsBuffer: Buffer;
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
/* export */ declare class PropertyAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Properties have no server-side representation (unless RenderOptions.serializePropertyAttributes),
   * so always returns an empty string.
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
/* export */ declare class EventAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}

/**
 * A class for consuming the combined static and dynamic parts of a lit-html Template.
 */
/* export */ declare class TemplateResult {
  template: Template;
  values: ReadonlyArray<unknown>;
  id: number;
  index: number;

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
 * A class for consuming the combined static and dynamic parts of a lit-html svg Template.
 */
/* export */ declare class SVGTemplateResult extends TemplateResult {}

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
/* export */ declare class Template {
  strings: Array<Buffer | null>;
  parts: Array<Part | null>;

  /**
   * Create Template instance
   */
  constructor(strings: TemplateStringsArray, processor: TemplateProcessor);

  /**
   * Prepare the template's static strings,
   * and create Part instances for the dynamic values,
   * based on lit-html syntax.
   */
  _prepare(strings: TemplateStringsArray, processor: TemplateProcessor): void;
}

/* export */ declare type RenderOptions = {
  serializePropertyAttributes: boolean;
};

/**
 * Define new directive for "fn".
 * The passed function should be a factory function,
 * and must return a function that will eventually be called with a Part instance
 */
/* export */ declare function directive<F extends (...args: Array<any>) => object>(f: F): F;

/**
 * Determine if "fn" is a directive function
 */
/* export */ declare function isDirective(fn: unknown): fn is Function;

/**
 * Determine if "part" is an AttributePart
 */
/* export */ declare function isAttributePart(part: unknown): part is AttributePart;

/**
 * Determine if "part" is a ChildPart
 */
/* export */ declare function isChildPart(part: unknown): part is ChildPart;

/**
 * Determine whether "result" is a TemplateResult
 */
/* export */ declare function isTemplateResult(result: unknown): result is TemplateResult;

/**
 * A value for parts that signals a Part to clear its content
 */
/* export */ declare const nothing: string;
/**
 * A prefix value for strings that should not be escaped
 */
/* export */ declare const unsafePrefixString: string;
/* export */ declare const templateCache: Map<TemplateStringsArray, Template>;

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream or String
 */
/* export */ declare function html(strings: TemplateStringsArray, ...values: Array<unknown>): TemplateResult;
/* export */ declare function svg(strings: TemplateStringsArray, ...values: Array<unknown>): TemplateResult;

/**
 * Render a template result to a string resolving Promise.
 */
/* export */ declare function renderToString(result: unknown, options?: RenderOptions): Promise<string>;

/**
 * Render a template result to a Readable stream
 */
/* export */ declare function renderToStream(result: unknown, options?: RenderOptions): import('stream').Readable;

/**
 * Render a template result to a Buffer resolving Promise.
 */
/* export */ declare function renderToBuffer(result: unknown, options?: RenderOptions): Promise<Buffer>;
