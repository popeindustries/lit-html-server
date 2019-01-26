import { AttributePart } from './parts.js';

export class TemplateResult {
  /**
   *
   *
   * @param { Template } template
   * @param { Array<any> } values
   * @returns { TemplateResult }
   */
  constructor(template, values) {
    this.template = template;
    this.values = values;
    this.index = 0;
  }

  read() {
    const isString = this.index % 2 === 0;
    const index = (this.index / 2) | 0;

    if (!isString && this.index >= this.template.strings.length) {
      this.index = 0;
      return null;
    }

    this.index++;

    if (isString) {
      return this.template.strings[index];
    }

    const part = this.template.parts[index];
    let value;

    if (part instanceof AttributePart) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already stored in the instance)
      if (part.length > 1) {
        value = part.getValue(this.values.slice(index, index + part.length));
        this.index += part.length - 1;
      } else {
        value = part.getValue([this.values[index]]);
      }
    } else {
      value = part.getValue(this.values[index]);
    }

    return value;
  }

  destroy() {
    this.values.length = 0;
    this.values = null;
    this.template = null;
    this.index = 0;
  }
}
