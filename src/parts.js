import { isPrimitive, isPromise, isSyncIterator } from './is.js';
import { isDirective } from './directive.js';
import { isTemplateResult } from './template-result.js';

/**
 * A sentinel value that signals a Part to fully clear its content.
 */
export const nothing = {};

/**
 * A dynamic template part for text nodes
 */
export class NodePart {
  /**
   * Retrieve string from 'value'
   * @param {any} value
   * @returns {string|Promise<string>}
   */
  getString(value) {
    return resolveValues([value])[0];
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
   * Retrieve string from 'values'.
   * Resolves to a single string, or Promise for a string,
   * even when responsible for multiple values.
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getString(values) {
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
   * Retrieve string from 'values'
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getString(values) {
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
   * Retrieve string from 'values'
   * @param {Array<any>} values
   * @returns {string}
   */
  getString(/* values */) {
    return '';
  }
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
export class EventAttributePart extends AttributePart {
  /**
   * Retrieve string from 'values'
   * @param {Array<any>} values
   * @returns {string}
   */
  getString(/* values */) {
    return '';
  }
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
    } else if (isTemplateResult(value) && value.isAsync) {
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
