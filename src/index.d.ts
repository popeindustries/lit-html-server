declare const HTML_RESULT = 1;
declare const SVG_RESULT = 2;

declare type ResultType = typeof HTML_RESULT | typeof SVG_RESULT;

/**
 * The return type of the template tag functions
 */
/* export  */ declare type TemplateResult<T extends ResultType = ResultType> = {
  _type: T;
  strings: TemplateStringsArray;
  values: unknown[];
};
/* export  */ declare type HTMLTemplateResult = TemplateResult<typeof HTML_RESULT>;
/* export  */ declare type SVGTemplateResult = TemplateResult<typeof SVG_RESULT>;

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
/* export  */ declare class Template {
  strings: Array<Buffer | null>;
  protected parts: Array<Part | null>;
  constructor(strings: TemplateStringsArray, processor: TemplateProcessor);
  protected _prepare(strings: TemplateStringsArray, processor: TemplateProcessor): void;
}

/* export type { ChildPart, AttributePart, PropertyPart, BooleanAttributePart, EventPart, ElementPart }; */
/**
 * A dynamic template part for text nodes
 */
declare class ChildPart {
  tagName: string;
  readonly type = 2;
  protected _value: unknown;
  constructor(tagName: string);
  /**
   * Retrieve resolved string from passed `value`
   */
  getValue(value: unknown, options?: RenderOptions): unknown;
  /**
   * Store the current value.
   * Used by directives to temporarily transfer value
   * (value will be deleted after reading).
   */
  setValue(value: unknown): void;
  /**
   * No-op
   */
  commit(): void;
}
/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 */
declare class AttributePart {
  strings: Array<Buffer>;
  tagName: string;
  readonly name: string;
  readonly type: 1 | 3 | 4 | 5 | 6;
  protected length: number;
  protected prefix: Buffer;
  protected suffix: Buffer;
  protected _value: unknown;
  constructor(name: string, strings: Array<Buffer>, tagName: string);
  /*
   * Retrieve resolved string from passed `value`
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
  /**
   * Store the current value.
   * Used by directives to temporarily transfer value (value will be deleted after reading).
   */
  setValue(value: unknown): void;
  /**
   * No-op
   */
  commit(): void;
}
/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
declare class PropertyPart extends AttributePart {
  readonly type = 3;
  /**
   * Retrieve resolved string Buffer from passed `values`.
   * Properties have no server-side representation unless `RenderOptions.serializePropertyAttributes`
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer | Promise<Buffer>;
}
/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
declare class BooleanAttributePart extends AttributePart {
  readonly type = 4;
  protected nameAsBuffer: Buffer;
}
/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
declare class EventPart extends AttributePart {
  readonly type = 5;
  /**
   * Retrieve resolved string Buffer from passed `values`.
   * Event bindings have no server-side representation, so always returns an empty string.
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
/**
 * A dynamic template part for accessing element instances.
 */
declare class ElementPart extends AttributePart {
  readonly type = 6;
  /**
   * Retrieve resolved string Buffer from passed `values`.
   * Element bindings have no server-side representation, so always returns an empty string.
   */
  getValue(values: Array<unknown>, options?: RenderOptions): Buffer;
}
/* export  */ declare type Part =
  | ChildPart
  | AttributePart
  | PropertyPart
  | BooleanAttributePart
  | ElementPart
  | EventPart;

/**
 * Interprets a template literal as an HTML template that can be
 * rendered as a Readable stream, string, or Buffer
 */
/* export  */ declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult<HTML_RESULT>;
/**
 * Interprets a template literal as a SVG template that can be
 * rendered as a Readable stream, string, or Buffer
 */
/* export  */ declare const svg: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult<SVG_RESULT>;

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written
 */
/* export  */ declare const noChange: unique symbol;
/**
 * A sentinel value that signals a ChildPart to fully clear its content
 */
/* export  */ declare const nothing: unique symbol;

/**
 * Options supported by template render functions
 */
/* export  */ type RenderOptions = {
  /** JSON serialize property attributes (default `false`) */
  serializePropertyAttributes: boolean;
};

/**
 * Renders a value, usually a TemplateResult, to a string resolving Promise
 */
/* export  */ function renderToString(value: unknown, options?: RenderOptions): Promise<string>;
/**
 * Renders a value, usually a lit-html TemplateResult, to a Readable stream
 */
/* export  */ function renderToStream(value: unknown, options?: RenderOptions): import('stream').Readable;
/**
 * Renders a value, usually a lit-html TemplateResult, to a Buffer resolving Promise
 */
/* export  */ function renderToBuffer(value: unknown, options?: RenderOptions): Promise<Buffer>;
