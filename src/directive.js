/**
 * Determine if "obj" is a directive function
 *
 * @param { unknown } fn
 * @returns { fn is Function }
 */
export function isDirective(fn) {
  // @ts-ignore
  return typeof fn === 'function' && fn.isDirective;
}

/**
 * Define new directive for "fn".
 * The passed function should be a factory function,
 * and must return a function that will eventually be called with a Part instance
 *
 * @param { (...args: Array<unknown>) => (part: Part) => void } fn
 * @returns { (...args: Array<unknown>) => (part: Part) => void }
 */
export function directive(fn) {
  return function directive(...args) {
    const result = fn(...args);

    if (typeof result !== 'function') {
      throw Error('directives are factory functions and must return a function when called');
    }

    // @ts-ignore
    result.isDirective = true;
    return result;
  };
}
