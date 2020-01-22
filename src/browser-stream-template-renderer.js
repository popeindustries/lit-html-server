/* global ReadableStream */
/**
 * A custom Readable stream factory for rendering a template result to a stream
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { TemplateResultProcessor } processor
 * @param { RenderOptions } [options]
 * @returns { ReadableStream }
 */
export function browserStreamTemplateRenderer(result, processor, options) {
  if (typeof ReadableStream === 'undefined') {
    throw Error('ReadableStream not supported on this platform');
  }
  if (typeof TextEncoder === 'undefined') {
    throw Error('TextEncoder not supported on this platform');
  }

  return new ReadableStream({
    // @ts-ignore
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
            return controller.desiredSize != null ? controller.desiredSize > 0 : true;
          },
          destroy(err) {
            controller.error(err);
            underlyingSource.process = undefined;
            // @ts-ignore
            stack = undefined;
          }
        },
        stack,
        16384,
        options
      );
    },
    pull() {
      this.process();
    }
  });
}
