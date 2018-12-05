/**
 * Determine if 'obj' is a directive function
 * @param {*} obj
 * @returns {boolean}
 */
export function isDirective(obj) {
  return typeof obj === 'function' && obj.isDirective;
}

/**
 * Define new directive for 'fn'
 * @param {function} fn
 * @returns {function}
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
