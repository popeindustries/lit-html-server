import { Buffer } from 'buffer';

export { isAttributePart, isDirective, isNodePart, isPrimitive } from './shared.js';

/**
 * Determine whether "result" is a TemplateResult
 *
 * @param { unknown } result
 * @returns { result is TemplateResult }
 */
export function isTemplateResult(result) {
  // @ts-ignore
  return result && typeof result.template !== 'undefined' && typeof result.values !== 'undefined';
}

/**
 * Determine if "promise" is a Promise instance
 *
 * @param { object } promise
 * @returns { promise is Promise<unknown> }
 */
export function isPromise(promise) {
  return promise != null && promise.then != null;
}

/**
 * Determine if "iterator" is an synchronous iterator
 *
 * @param { unknown } iterator
 * @returns { iterator is IterableIterator<unknown> }
 */
export function isSyncIterator(iterator) {
  return (
    iterator != null &&
    // Ignore strings (which are also iterable)
    typeof iterator !== 'string' &&
    // @ts-ignore
    typeof iterator[Symbol.iterator] === 'function'
  );
}

/**
 * Determine if "iterator" is an asynchronous iterator
 *
 * @param { unknown } iterator
 * @returns { iterator is AsyncIterable<unknown> }
 */
export function isAsyncIterator(iterator) {
  // @ts-ignore
  return iterator != null && typeof iterator[Symbol.asyncIterator] === 'function';
}

/**
 * Determine if "result" is an iterator result object
 *
 * @param { unknown } result
 * @returns { result is IteratorResult<unknown, unknown> }
 */
export function isIteratorResult(result) {
  // @ts-ignore
  return result != null && typeof result === 'object' && 'value' in result && 'done' in result;
}

/**
 * Determine if "value" is an object
 *
 * @param { unknown } value
 * @returns { value is object }
 */
export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Determine if "value" is a Buffer
 *
 * @param { unknown } value
 * @returns { value is Buffer }
 */
export function isBuffer(value) {
  return Buffer.isBuffer(value);
}

/**
 * Determine if "value" is an Array
 *
 * @param { unknown } value
 * @returns { value is Array }
 */
export function isArray(value) {
  return Array.isArray(value);
}
