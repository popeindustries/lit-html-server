import { getProcessor } from './template-result-processor.js';
import { Readable } from 'stream';

/**
 * Factory for StreamTemplateRenderer instances
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { Readable }
 */
export function streamTemplateRenderer(result, options) {
  return new StreamTemplateRenderer(result, options);
}

/**
 * A custom Readable stream class for rendering a template result to a stream
 */
class StreamTemplateRenderer extends Readable {
  /**
   * Constructor
   *
   * @param { TemplateResult } result - a template result returned from call to "html`...`"
   * @param { RenderOptions } [options]
   */
  constructor(result, options) {
    super({ autoDestroy: true });

    this.stack = [result];
    this.process = getProcessor(this, this.stack, 16384, options);
  }

  /**
   * Extend Readable.read()
   */
  _read() {
    if (this.process !== undefined) {
      this.process();
    }
  }

  /**
   * Extend Readalbe.destroy()
   *
   * @param { Error | null } [err]
   */
  _destroy(err) {
    if (err) {
      this.emit('error', err);
    }
    this.emit('close');

    // @ts-ignore
    this.process = undefined;
    // @ts-ignore
    this.stack = undefined;
    this.removeAllListeners();
  }
}
