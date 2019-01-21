import { AttributePart } from './parts.js';
import { isPromise } from './is.js';

/**
 * Determine if 'obj' is a template result
 * @param {any} obj
 * @returns {boolean}
 */
export function isTemplateResult(obj) {
  return Array.isArray(obj) && obj.isTemplateResult;
}

/**
 *
 * @param {Template} template
 * @param {Array<any>} values
 */
export function templateResult(template, values) {
  const { strings, parts } = template;
  const endIndex = strings.length - 1;
  const result = [];
  let buffer = '';

  for (let i = 0; i < endIndex; i++) {
    const string = strings[i];
    const part = parts[i];
    let value = values[i];

    buffer += string;

    if (part instanceof AttributePart) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already stored in the instance)
      if (part.length > 1) {
        value = part.getValue(values.slice(i, i + part.length));
        i += part.length - 1;
      } else {
        value = part.getValue([value]);
      }
    } else {
      value = part.getValue(value);
    }

    buffer = reduce(buffer, result, value);
  }

  buffer += strings[endIndex];
  result.push(buffer);
  result.isTemplateResult = true;

  return result;
}

/**
 * Commit value to string buffer
 * @param {string} buffer
 * @param {Array<string|Promise<string>>} result
 * @param {*} value
 * @returns {string}
 */
function reduce(buffer, result, value) {
  if (typeof value === 'string') {
    buffer += value;
    return buffer;
  } else if (Array.isArray(value)) {
    return value.reduce((buffer, value) => reduce(buffer, result, value), buffer);
  } else if (isPromise(value)) {
    result.push(buffer, value);
    return '';
  }
}
