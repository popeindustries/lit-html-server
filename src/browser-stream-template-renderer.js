/* global ReadableStream */
import { getProcessor } from './template-result-processor.js';

/**
 * A custom Readable stream factory for rendering a template result to a stream
 *
 * @param { TemplateResult } result - a template result returned from call to "html`...`"
 * @param { RenderOptions } [options]
 * @returns { ReadableStream }
 */
export function browserStreamTemplateRenderer(result, options) {
  if (typeof ReadableStream === 'undefined') {
    throw Error('ReadableStream not supported on this platform');
  }
  if (typeof TextEncoder === 'undefined') {
    throw Error('TextEncoder not supported on this platform');
  }

  /** @type { UnderlyingSource & { process: (() => void) }} */
  const underlyingSource = {
    process: () => {},
    start(controller) {
      const encoder = new TextEncoder();
      let stack = [result];

      this.process = getProcessor(
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
            // @ts-ignore
            stack = undefined;
          },
        },
        stack,
        16384,
        options,
      );
    },
    pull() {
      this.process();
    },
  };

  return new ReadableStream(underlyingSource);
}
