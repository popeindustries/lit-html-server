/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
/**
 * @typedef TemplateResultProcessor { import('./default-template-result-processor.js).TemplateResultProcessor }
 */
/**
 * @typedef TemplateResultRenderer { import('./default-template-result-renderer.js).TemplateResultRenderer }
 */
import { Readable } from 'stream';

/**
 * A custom Readable stream class for rendering a template result to a stream
 *
 * @implements TemplateResultRenderer
 */
export class StreamTemplateRenderer extends Readable {
  /**
   * Constructor
   *
   * @param { TemplateResult } result - a template result returned from call to "html`...`"
   * @param { TemplateResultProcessor } processor
   * @returns { Readable }
   */
  constructor(result, processor) {
    super({ autoDestroy: true });

    this.awaitingPromise = false;
    this.processor = processor;
    this.stack = [result];
  }

  /**
   * Extend Readable.read()
   */
  _read() {
    this.processor.process(this, this.stack);
  }

  /**
   * Extend Readalbe.destroy()
   *
   * @param { Error } [err]
   */
  _destroy(err) {
    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    this.stack.length = 0;
    this.stack = [];
    this.processor = null;
    this.removeAllListeners();
  }
}
