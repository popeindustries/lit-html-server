declare module '@popeindustries/lit-html-server' {
  type Directive = (...args: Array<unknown>) => (part: Part) => void;

  interface TemplateProcessor {
    handleAttributeExpressions: (name: string, strings: TemplateStringsArray) => AttributePart;
    handleTextExpression: () => NodePart;
  }

  interface TemplateResultRenderer {
    push: (chunk: Buffer) => boolean;
    destroy: (err: Error) => void;
  }

  const defaultTemplateProcessor: DefaultTemplateProcessor;
  const defaultTemplateResultProcessor: DefaultTemplateResultProcessor;

  /**
   * Define new directive for "fn".
   * The passed function should be a factory function,
   * and must return a function that will eventually be called with a Part instance
   */
  function directive(fn: Directive): Directive;

  /**
   * Determine if "part" is an AttributePart
   */
  function isAttributePart(part: Part): boolean;

  /**
   * Determine if "part" is a NodePart
   */
  function isNodePart(part: Part): boolean;

  /**
   * Determine whether "result" is a TemplateResult
   */
  function isTemplateResult(result: TemplateResult): boolean;

  /**
   * A value for strings that signals a Part to clear its content
   */
  const nothingString: string;
  const templateCache: Map<TemplateStringsArray, Template>;

  /**
   * A prefix value for strings that should not be escaped
   */
  const unsafePrefixString: string;

  /**
   * Interprets a template literal as an HTML template that can be
   * rendered as a Readable stream or String
   */
  function html(strings: TemplateStringsArray, ...values: Array<unknown>): TemplateResult;
  function svg(strings: TemplateStringsArray, ...values: Array<unknown>): TemplateResult;

  /**
   * Render a template result to a string resolving Promise.
   * *Note* that TemplateResults are single use, and can only be rendered once.
   */
  function renderToString(result: TemplateResult): Promise<string>;

  /**
   * Render a template result to a Readable stream
   * *Note* that TemplateResults are single use, and can only be rendered once.
   */
  function renderToStream(result: TemplateResult): import('stream').Readable;

  /**
   * Render a template result to a Buffer resolving Promise.
   * *Note* that TemplateResults are single use, and can only be rendered once.
   */
  function renderToBuffer(result: TemplateResult): Promise<Buffer>;

  /**
   * Base class interface for Node/Attribute parts
   */
  class Part {
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
  class NodePart extends Part {
    /**
     * Retrieve resolved value given passed "value"
     */
    getValue(value: unknown): unknown;
  }

  /**
   * A dynamic template part for attributes.
   * Unlike text nodes, attributes may contain multiple strings and parts.
   */
  class AttributePart extends Part {
    /*
     * @param { Array<any> } values
     * @returns { Buffer|Promise<Buffer> }
     */
    getValue(values: Array<unknown>): Buffer | Promise<Buffer>;
  }

  /**
   * A dynamic template part for boolean attributes.
   * Boolean attributes are prefixed with "?"
   */
  class BooleanAttributePart extends AttributePart {
    /**
     * Retrieve resolved string Buffer from passed "values".
     */
    getValue(values: Array<unknown>): Buffer | Promise<Buffer>;
  }

  /**
   * A dynamic template part for property attributes.
   * Property attributes are prefixed with "."
   */
  class PropertyAttributePart extends AttributePart {
    /**
     * Retrieve resolved string Buffer from passed "values".
     * Properties have no server-side representation,
     * so always returns an empty string.
     */
    getValue(values: Array<unknown>): Buffer;
  }

  /**
   * A dynamic template part for event attributes.
   * Event attributes are prefixed with "@"
   */
  class EventAttributePart extends AttributePart {
    /**
     * Retrieve resolved string Buffer from passed "values".
     * Event bindings have no server-side representation,
     * so always returns an empty string.
     */
    getValue(values: Array<unknown>): Buffer;
  }

  /**
   * Class representing the default Template processor.
   * Exposes factory functions for generating Part instances to use for
   * resolving a template's dynamic values.
   */
  class DefaultTemplateProcessor {
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
  class DefaultTemplateResultProcessor {
    /**
     * Process "stack" and push chunks to "renderer"
     */
    getProcessor(
      renderer: TemplateResultRenderer,
      stack: Array<unknown>,
      highWaterMark?: number
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
     * *Note* that instances may only be read once,
     * and will be destroyed upon completion.
     */
    read(deep: boolean): unknown;

    /**
     * Consume template result content one chunk at a time.
     * *Note* that instances may only be read once,
     * and will be destroyed when the last chunk is read.
     */
    readChunk(): unknown;

    /**
     * Destroy the instance,
     * returning it to the object pool
     */
    destroy(permanent: boolean): void;
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
}
