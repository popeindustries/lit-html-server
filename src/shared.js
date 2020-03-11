/**
 * Collection of shared utilities used by directives.
 * Manually added to ensure that directives can be used by both index.js and browser.js
 */

/**
 * A value for parts that signals a Part to clear its content
 */
export const nothing = {};

/**
 * A prefix value for strings that should not be escaped
 */
export const unsafePrefixString = '__unsafe-lit-html-server-string__';

/**
 * Determine if "part" is a NodePart
 *
 * @param { unknown } part
 * @returns { part is NodePart }
 */
export function isNodePart(part) {
  // @ts-ignore
  return part && part.getValue !== undefined && !('name' in part);
}

/**
 * Determine if "part" is an AttributePart
 *
 * @param { unknown } part
 * @returns { part is AttributePart }
 */
export function isAttributePart(part) {
  // @ts-ignore
  return part && part.getValue !== undefined && 'name' in part;
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
