/**
 * @typedef TemplateResultProcessor
 * @property { (template: Template, values: Array<any>) => TemplateResult } processTemplate
 */
/**
 * @typedef Template { import('./template.js).Template }
 * @typedef TemplateResult { import('./template-result.js).TemplateResult }
 */
import { AttributePart } from './parts.js';
import { isPromise } from './is.js';

/**
 * Class representing the default template result processor.
 * @implements TemplateResultProcessor
 */
export class DefaultTemplateResultProcessor {
  /**
   * Create template result array from "template" instance and dynamic "values".
   * The returned array contains Template "strings" concatenated with known string "values",
   * and any Promises that will eventually resolve asynchronous string "values".
   * A synchronous template tree will reduce to an array containing a single string.
   * An asynchronous template tree will reduce to an array of strings and Promises.
   *
   * @param { Template } template
   * @param { Array<any> } values
   * @returns { TemplateResult }
   */
  processTemplate(template, values) {
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

      if (typeof value === 'string') {
        buffer += value;
      } else {
        buffer = reduce(buffer, result, value);
      }
    }

    buffer += strings[endIndex];
    result.push(buffer);

    return result;
  }
}

/**
 * Commit value to string "buffer"
 *
 * @param { string } buffer
 * @param { TemplateResult } result
 * @param { any } value
 * @returns { string }
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
