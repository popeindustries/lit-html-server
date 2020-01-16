import { isArray, isAsyncIterator, isBuffer, isPromise } from './is.js';
import { emptyStringBuffer } from './string.js';
import { isAttributePart } from './parts.js';

let id = 0;

/**
 * Determine whether "result" is a TemplateResult
 *
 * @param { unknown } result
 * @returns { result is TemplateResult }
 */
export function isTemplateResult(result) {
  return (
    result instanceof TemplateResult ||
    // @ts-ignore
    (result && typeof result.template !== 'undefined' && typeof result.values !== 'undefined')
  );
}

/**
 * A class for consuming the combined static and dynamic parts of a lit-html Template.
 * TemplateResults
 */
export class TemplateResult {
  /**
   * Constructor
   *
   * @param { Template } template
   * @param { Array<unknown> } values
   */
  constructor(template, values) {
    this.template = template;
    this.values = values;
    this.id = id++;
    this.index = 0;
  }

  /**
   * Consume template result content.
   *
   * @param { RenderOptions } [options]
   * @returns { unknown }
   */
  read(options) {
    let buffer = emptyStringBuffer;
    let chunk;
    /** @type { Array<Buffer> | undefined } */
    let chunks;

    while ((chunk = this.readChunk(options)) !== null) {
      if (isBuffer(chunk)) {
        buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
      } else {
        if (chunks === undefined) {
          chunks = [];
        }
        buffer = reduce(buffer, chunks, chunk) || emptyStringBuffer;
      }
    }

    if (chunks !== undefined) {
      chunks.push(buffer);
      return chunks.length > 1 ? chunks : chunks[0];
    }

    return buffer;
  }

  /**
   * Consume template result content one chunk at a time.
   * @param { RenderOptions } [options]
   * @returns { unknown }
   */
  readChunk(options) {
    const isString = this.index % 2 === 0;
    const index = (this.index / 2) | 0;

    // Finished
    if (!isString && index >= this.template.strings.length - 1) {
      // Reset
      this.index = 0;
      return null;
    }

    this.index++;

    if (isString) {
      return this.template.strings[index];
    }

    const part = this.template.parts[index];
    let value;

    if (isAttributePart(part)) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already handled the instance)
      if (part.length > 1) {
        value = part.getValue(this.values.slice(index, index + part.length), options);
        this.index += part.length;
      } else {
        value = part.getValue([this.values[index]], options);
      }
    } else {
      value = part && part.getValue(this.values[index], options);
    }

    return value;
  }
}

/**
 * Commit "chunk" to string "buffer".
 * Returns new "buffer" value.
 *
 * @param { Buffer } buffer
 * @param { Array<unknown> } chunks
 * @param { unknown } chunk
 * @returns { Buffer | undefined }
 */
function reduce(buffer, chunks, chunk) {
  if (isBuffer(chunk)) {
    return Buffer.concat([buffer, chunk], buffer.length + chunk.length);
  } else if (isTemplateResult(chunk)) {
    chunks.push(buffer, chunk);
    return emptyStringBuffer;
  } else if (isArray(chunk)) {
    return chunk.reduce((buffer, chunk) => reduce(buffer, chunks, chunk), buffer);
  } else if (isPromise(chunk) || isAsyncIterator(chunk)) {
    chunks.push(buffer, chunk);
    return emptyStringBuffer;
  }
}
