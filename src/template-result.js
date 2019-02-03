import { isAsyncIterator, isPromise } from './is.js';
import { AttributePart } from './parts.js';
import { emptyStringBuffer } from './string.js';

const pool = [];
let id = 0;

/**
 * Determine whether "result" is a TemplateResult
 *
 * @param { TemplateResult } result
 * @returns { boolean }
 */
export function isTemplateResult(result) {
  return result instanceof TemplateResult;
}

/**
 * Retrieve TemplateResult instance.
 * Uses an object pool to recycle instances.
 *
 * @param { Template } template
 * @param { Array<any> } values
 * @returns { TemplateResult }
 */
export function templateResult(template, values) {
  let instance = pool.pop();

  if (instance) {
    instance.template = template;
    instance.values = values;
  } else {
    instance = new TemplateResult(template, values);
  }

  return instance;
}

/**
 * A class for consuming the combined static and dynamic parts of a lit-html Template.
 * TemplateResults
 */
class TemplateResult {
  /**
   * Constructor
   *
   * @param { Template } template
   * @param { Array<any> } values
   */
  constructor(template, values) {
    this.template = template;
    this.values = values;
    this.id = id++;
    this.index = 0;
  }

  /**
   * Consume template result content.
   * *Note* that instances may only be read once,
   * and will be destroyed upon completion.
   *
   * @param { boolean } deep - recursively resolve nested TemplateResults
   * @returns { any }
   */
  read(deep) {
    let buffer = emptyStringBuffer;
    let chunk, chunks;

    while ((chunk = this.readChunk()) !== null) {
      if (Buffer.isBuffer(chunk)) {
        buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
      } else {
        if (chunks === undefined) {
          chunks = [];
        }
        buffer = reduce(buffer, chunks, chunk, deep);
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
   * *Note* that instances may only be read once,
   * and will be destroyed when the last chunk is read.
   *
   * @returns { any }
   */
  readChunk() {
    const isString = this.index % 2 === 0;
    const index = (this.index / 2) | 0;

    // Finished
    if (!isString && index >= this.template.strings.length - 1) {
      this.destroy();
      return null;
    }

    this.index++;

    if (isString) {
      return this.template.strings[index];
    }

    const part = this.template.parts[index];
    let value;

    if (part instanceof AttributePart) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already handled the instance)
      if (part.length > 1) {
        value = part.getValue(this.values.slice(index, index + part.length));
        this.index += part.length;
      } else {
        value = part.getValue([this.values[index]]);
      }
    } else {
      value = part.getValue(this.values[index]);
    }

    return value;
  }

  /**
   * Destroy the instance,
   * returning it to the object pool
   *
   * @param { boolean } permanent - permanently destroy instance and it's children
   * @returns { void }
   */
  destroy(permanent) {
    if (this.values !== undefined) {
      if (permanent) {
        for (const value of this.values) {
          if (isTemplateResult(value)) {
            value.destroy(permanent);
          }
        }
      }
      this.values.length = 0;
    }
    this.values = undefined;
    this.template = undefined;
    this.index = 0;
    if (!permanent) {
      pool.push(this);
    }
  }
}

/**
 * Commit "chunk" to string "buffer".
 * Returns new "buffer" value.
 *
 * @param { Buffer } buffer
 * @param { Array<any> } chunks
 * @param { any } chunk
 * @param { boolean } [deep]
 * @returns { Buffer }
 */
function reduce(buffer, chunks, chunk, deep = false) {
  if (Buffer.isBuffer(chunk)) {
    return Buffer.concat([buffer, chunk], buffer.length + chunk.length);
  } else if (isTemplateResult(chunk)) {
    if (deep) {
      return reduce(buffer, chunks, chunk.read(deep), deep);
    } else {
      chunks.push(buffer, chunk);
      return emptyStringBuffer;
    }
  } else if (Array.isArray(chunk)) {
    return chunk.reduce((buffer, chunk) => reduce(buffer, chunks, chunk), buffer);
  } else if (isPromise(chunk) || isAsyncIterator(chunk)) {
    chunks.push(buffer, chunk);
    return emptyStringBuffer;
  }
}
