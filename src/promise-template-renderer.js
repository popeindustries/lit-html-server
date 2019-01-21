import { AttributePart } from './parts.js';
import { isPromise } from './is.js';
import { TemplateResult } from './template-result.js';

export class PromiseTemplateRenderer {
  /**
   * Constructor
   * @param {TemplateResult} result
   */
  constructor(result) {
    this.result = result;
    this.buffer = '';
    this.chunks = [];
    this.outstanding = 0;
  }

  /**
   * Render to a string resolving Promise
   * @param {TemplateResult} [result]
   * @returns {Promise<string>}
   */
  render(result = this.result) {
    const {
      template: { strings, parts },
      values
    } = result;
    const endIndex = strings.length - 1;

    for (let i = 0; i < endIndex; i++) {
      const string = strings[i];
      const part = parts[i];
      let value = values[i];

      this.buffer += string;

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
          // result.push(html, value);
          // html = '';
        } else {
          // html += value;
        }
      } else {
        this._commit(part.getHTML(value));
      }
    }

    this.buffer += strings[endIndex];
  }

  _commit(value) {
    if (typeof value === 'string') {
      this.buffer += value;
    } else if (value instanceof TemplateResult) {
      // this.render(value);
    } else if (Array.isArray(value)) {
      value.forEach(this._commit);
    } else if (isPromise(value)) {
      let index = this.chunks.push(this.buffer, value) - 1;

      this.buffer = '';
      this.outstanding++;
      value.then((value) => {
        this.chunks[index] = this._commit(value);
        if (!--this.outstanding) {
          //
        }
      });
    }
  }
}
