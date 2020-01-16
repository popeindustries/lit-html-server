import { Readable } from 'stream';

/**
 * A custom Readable stream class for rendering a template result to a stream
 *
 * @implements TemplateResultRenderer
 */
export class StreamTemplateRenderer extends Readable {
  /**
   * Constructor
   * @param { TemplateResult } result - a template result returned from call to "html`...`"
   * @param { TemplateResultProcessor } processor
   * @param { RenderOptions } [options]
   *
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
