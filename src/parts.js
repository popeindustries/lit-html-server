/**
 * @typedef TemplatePartValue
 */

import { isPrimitive, isPromise, isSyncIterator } from './is.js';
import { isDirective } from './directive.js';

/**
 * A sentinel value that signals a Part to fully clear its content.
 */
export const nothing = {};

/**
 * A dynamic template part for text nodes
 */
export class NodePart {
  /**
   * Retrieve HTML string from 'value'
   * @param {any} value
   * @returns {TemplatePartValue|Array<TemplatePartValue>}
   */
  getHTML(value) {
    return resolveValue(value);
  }
}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
 */
export class AttributePart {
  /**
   * Constructor
   * @param {string} name
   * @param {Array<string>} strings
   */
  constructor(name, strings) {
    this.name = name;
    this.strings = strings;
    this.length = strings.length - 1;
  }

  /**
   * Retrieve HTML string from 'values'.
   * Resolves to a single string, or Promise for a string,
   * even when responsible for multiple values.
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getHTML(values) {
    values = resolveValues(values, this);

    // Bail if 'nothing'
    if (values === nothing) {
      return '';
    }

    // TODO: handle values Promise

    const strings = this.strings;
    const endIndex = strings.length - 1;
    let result = `${this.name}="`;

    for (let i = 0; i < endIndex; i++) {
      const string = strings[i];
      let value = values[i];

      result += string + value;
    }

    result += `${strings[endIndex]}"`;

    return result;
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
   * Retrieve HTML string from 'values'
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getHTML(values) {
    let value = values[0];

    if (isDirective(value)) {
      value = value(this);
    }
    if (isPromise(value)) {
      return value.then((v) => (v ? this.name : ''));
    } else {
      return value ? this.name : '';
    }
  }
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
export class PropertyAttributePart extends AttributePart {
  /**
   * Retrieve HTML string from 'values'
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
export class EventAttributePart extends AttributePart {
  /**
   * Retrieve HTML string from 'values'
   * @param {Array<any>} values
   * @returns {string}
   */
  getHTML(/* values */) {
    return '';
  }
}

/**
 * Resolve 'value' to string
 * @param {any} value
 * @param {NodePart} part
 * @returns {TemplatePartValue}
 */
function resolveValue(value, part) {
  if (isDirective(value)) {
    value = value(part);
  }

  if (value === undefined || value === nothing) {
    return '';
  } else if (isPrimitive(value)) {
    // TODO: escape if not "no-escape"
    return String(value);
  }
  if (isPromise(value)) {
    return value.then((result) => resolveValue(result, part));
  }
  if (isSyncIterator(value)) {
    if (!Array.isArray(value)) {
      value = Array.from(value);
    }
    return value.reduce((values, value) => {
      value = resolveValue(value, part);
      if (Array.isArray(value)) {
        return values.concat(value);
      }
      values.push(value);
      return values;
    }, []);
  }

  // Pass-through TemplateResult
  return value;
}

function resolveValues(values, part) {
  if (!Array.isArray(values)) {
    values = [values];
  }

  for (let i = 0, n = values.length; i < n; i++) {
    let value = values[i];

    if (isDirective(value)) {
      value = value(part);
    }

    if (isPrimitive(value)) {
      // TODO: escape
      values[i] = String(value);
      // } else if (isTemplateResult(value) && value.isAsync) {
      // TODO: template result with one or more Promises
    } else if (isPromise(value)) {
      // ?
    } else if (Array.isArray(value)) {
      values[i] = resolveValues(value, part).join('');
    } else if (isSyncIterator(value)) {
      values[i] = resolveValues(Array.from(value), part).join('');
    } else if (value === nothing) {
      values = nothing;
    }
  }

  return values;
}
