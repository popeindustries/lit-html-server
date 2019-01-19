import { isDirective, isSyncIterator } from './is.js';

/**
 * A basic interface for a dynamic template part
 */
export class Part {
  /**
   * Retrieve html string from 'value'
   * @param {any} value
   * @returns {string}
   */
  getHTML(value) {
    return String(value);
  }
}

/**
 * A dynamic template part for text nodes
 */
export class NodePart extends Part {
  /**
   * Retrieve html string from 'value'
   * @param {any} value
   * @returns {string|Promise<string>}
   */
  getHTML(value) {
    if (isDirective(value)) {
      value = value(this);
    }

    return value;
  }
}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes can contain multiple strings and parts.
 */
export class AttributePart extends Part {
  /**
   * Constructor
   * @param {string} name
   * @param {Array<string>} strings
   */
  constructor(name, strings) {
    super();
    this.name = name;
    this.strings = strings;
    this.length = strings.length - 1;
  }

  /**
   * Retrieve html string from 'values'
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getHTML(values) {
    const strings = this.strings;
    const endIndex = strings.length - 1;
    let html = '';

    for (let i = 0; i < endIndex; i++) {
      const string = strings[i];
      const value = values[i];

      // TODO: handle directive
      // TODO: handle directive returning Promise

      if (value !== undefined) {
        if (isSyncIterator(value)) {
          for (const item of value) {
            html += typeof item === 'string' ? item : String(item);
          }
        } else {
          html += typeof value === 'string' ? value : String(value);
        }
      }

      html += string + value;
    }

    html += strings[endIndex];

    return html;
  }
}

/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
export class BooleanAttributePart extends AttributePart {
  /**
   * Constructor
   * @param {string} name
   * @param {Array<string>} strings
   * @throws error when multiple expressions
   */
  constructor(name, strings) {
    super(name, strings);

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw Error('Boolean attributes can only contain a single expression');
    }
  }

  /**
   * Retrieve html string from 'values'
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getHTML(values) {
    let value = values[0];

    if (isDirective(value)) {
      value = value(this);
    }

    // TODO: handle Promise

    return value ? this.name : '';
  }
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
export class PropertyAttributePart extends Part {
  /**
   * Retrieve html string from 'values'
   * @param {Array<any>} values
   * @returns {string}
   */
  getHTML(/* values */) {
    return '';
  }
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
export class EventAttributePart extends Part {
  /**
   * Retrieve html string from 'values'
   * @param {Array<any>} values
   * @returns {string}
   */
  getHTML(/* values */) {
    return '';
  }
}
