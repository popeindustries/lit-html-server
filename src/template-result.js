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
 * @param {Array<*>} values
 * @returns {Array<string|Promise<string>>}
 */
export function templateResult(template, values) {
  const { strings, parts } = template;
  const endIndex = strings.length - 1;
  let result = [];
  let html = '';

  for (let i = 0; i < endIndex; i++) {
    const string = strings[i];
    const part = parts[i];
    let value = values[i];

    html += string;

    if (part instanceof AttributePart) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already stored in the instance)
      if (part.length == 1) {
        value = part.getString([value]);
      } else {
        value = part.getString(values.slice(i, i + part.length));
        i += part.length - 1;
      }
      if (isPromise(value)) {
        result.push(html, value);
        html = '';
      } else {
        html += value;
      }
    } else {
      value = part.getString(value);
      // TODO: handle Array/Promise
      html += value;
    }
  }

  html += strings[endIndex];
  result.push(html);
  // result.isTemplateResult = true;
  return result;
}
