/**
 * @typedef Part { import('./parts.js').Part }
 */

/**
 * Determine if "obj" is a directive function
 *
 * @param { any } obj
 * @returns { boolean }
 */
export function isDirective(obj) {
  return typeof obj === 'function' && obj.isDirective;
}

/**
 * Define new directive for "fn".
 * The passed function should be a factory function,
 * and must return a function that will eventually be called with a Part instance
 *
 * @param { (...args) => (part: Part) => void } fn
 * @returns { (...args) => (part: Part) => void }
 */
export function directive(fn) {
  return function directive(...args) {
    const result = fn(...args);

    if (typeof result !== 'function') {
      throw Error('directives are factory functions and must return a function when called');
    }

    result.isDirective = true;
    return result;
  };
}
