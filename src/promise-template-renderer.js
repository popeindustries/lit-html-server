import { isPromise } from './is.js';

/**
 * Render a template result to a string resolving Promise
 * @param {Array<string|Promise<string>>} result
 * @returns {Promise<string>}
 */
export async function promiseTemplateRenderer(result) {
  let buffer = '';

  for (let chunk of result) {
    if (typeof chunk === 'string') {
      buffer += chunk;
    } else if (isPromise(chunk)) {
      chunk = await chunk;
      if (typeof chunk === 'string') {
        buffer += chunk;
      } else {
        buffer += await reduce(buffer, chunk);
      }
    }
  }

  return buffer;
}

async function reduce(buffer, value) {
  if (typeof value === 'string') {
    buffer += value;
    return buffer;
  } else if (Array.isArray(value)) {
    return value.reduce((buffer, value) => reduce(buffer, value), buffer);
  } else if (isPromise(value)) {
    return reduce(buffer, await value);
  }
}
