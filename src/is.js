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
 * @returns { iterator is IterableIterator }
 */
export function isSyncIterator(iterator) {
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
 * @param { unknown } iterator
 * @returns { iterator is AsyncIterableIterator }
 */
export function isAsyncIterator(iterator) {
  return iterator != null && typeof iterator[Symbol.asyncIterator] === 'function';
}

/**
 * Determine if "result" is an iterator result object
 *
 * @param { unknown } result
 * @returns { result is IteratorResult<T, TReturn> }
 */
export function isIteratorResult(result) {
  return typeof result === 'object' && 'value' in result && 'done' in result;
}

/**
 * Determine if "value" is a primitive
 *
 * @param { unknown } value
 * @returns { value is null|string|boolean|number }
 */
export function isPrimitive(value) {
  const type = typeof value;

  return value === null || !(type === 'object' || type === 'function');
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
