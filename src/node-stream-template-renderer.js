/**
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 * @typedef TemplateResultProcessor { import('./default-template-result-processor.js).TemplateResultProcessor }
 * @typedef TemplateResultRenderer { import('./default-template-result-renderer.js).TemplateResultRenderer }
 * @typedef RenderOptions { import('./index.js).RenderOptions }
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
   * @param { RenderOptions } [options]
   * @returns { Readable }
   */
  constructor(result, processor, options) {
    super({ autoDestroy: true });

    this.stack = [result];
    this.process = processor.getProcessor(this, this.stack, 16384, options);
  }

  /**
   * Extend Readable.read()
   */
  _read() {
    this.process();
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

    this.process = undefined;
    this.stack = undefined;
    this.removeAllListeners();
  }
}
