/* global ReadableStream */

/**
 * A custom Readable stream class for rendering a template result to a stream
 *
 * @implements TemplateResultRenderer
 */
export class StreamTemplateRenderer {
  /**
   * Constructor
   *
   * @param { TemplateResult } result - a template result returned from call to "html`...`"
   * @param { TemplateResultProcessor } processor
   * @returns { ReadableStream }
   */
  constructor(result, processor) {
    if (typeof ReadableStream === 'undefined') {
      throw Error('ReadableStream not supported on this platform');
    }
    if (typeof TextEncoder === 'undefined') {
      throw Error('TextEncoder not supported on this platform');
    }

    return new ReadableStream({
      process: null,
      start(controller) {
        const encoder = new TextEncoder();
        const underlyingSource = this;
        let stack = [result];

        this.process = processor.getProcessor(
          {
            push(chunk) {
              if (chunk === null) {
                controller.close();
                return false;
              }

              controller.enqueue(encoder.encode(chunk.toString()));
              // Pause processing (return "false") if stream is full
              return controller.desiredSize > 0;
            },
            destroy(err) {
              controller.error(err);
              underlyingSource.process = undefined;
              stack = undefined;
            }
          },
          stack,
          16384
        );
      },
      pull() {
        this.process();
      }
    });
  }
}
