export { isAsyncIterator, isPrimitive, isPromise, isSyncIterator };

/**
 * Determine if "promise" is a Promise instance
 *
 * @param { Promise<any> } promise
 * @returns { boolean }
 */
function isPromise(promise) {
  return promise != null && promise.then != null;
}

/**
 * Determine if "iterator" is an synchronous iterator
 *
 * @param { IterableIterator } iterator
 * @returns { boolean }
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
 * Determine if "iterator" is an asynchronous iterator
 *
 * @param { AsyncIterableIterator } iterator
 * @returns { boolean }
 */
function isAsyncIterator(iterator) {
  return iterator != null && typeof iterator[Symbol.asyncIterator] === 'function';
}

/**
 * Determine if "value" is a primitive
 *
 * @param { any } value
 * @returns { boolean }
 */
function isPrimitive(value) {
  const type = typeof value;

  return value === null || !(type === 'object' || type === 'function');
}
