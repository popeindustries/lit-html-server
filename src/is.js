import { unsafeStringPrefix } from './parts.js';

export { isAsyncIterator, isPrimitive, isPromise, isSyncIterator, isUnsafeString };

/**
 * Determine if 'promise' is a Promise instance
 * @param {Promise<any>} promise
 * @returns {boolean}
 */
function isPromise(promise) {
  return promise != null && promise.then != null;
}

/**
 * Determine if 'iterator' is an synchronous iterator
 * @param {IterableIterator} iterator
 * @returns {boolean}
 */
function isSyncIterator(iterator) {
  return (
    iterator != null &&
    // Ignore strings (which are also iterable)
    typeof iterator !== 'string' &&
    typeof iterator[Symbol.iterator] === 'function'
  );
}

/**
 * Determine if 'iterator' is an asynchronous iterator
 * @param {AsyncIterableIterator} iterator
 * @returns {boolean}
 */
function isAsyncIterator(iterator) {
  return iterator != null && typeof iterator[Symbol.asyncIterator] === 'function';
}

/**
 * Determine if 'value' is a primitive
 * @param {any} iterator
 * @returns {boolean}
 */
function isPrimitive(value) {
  const type = typeof value;

  return value === null || !(type === 'object' || type === 'function');
}

/**
 * Determine if 'string' is an unsafe string
 * @param {string} string
 * @returns {boolean}
 */
function isUnsafeString(string) {
  return typeof string === 'string' && string.indexOf(unsafeStringPrefix) === 0;
}
