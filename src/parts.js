import { isPrimitive, isPromise, isSyncIterator, isUnsafeString } from './is.js';
import escapeHTML from './escape.js';
import { isDirective } from './directive.js';
import { isTemplateResult } from './template-result.js';

/**
 * A sentinel value that signals a Part to fully clear its content.
 */
export const nothing = {};

/**
 * A prefix value for strings that should not be escaped
 */
export const unsafeStringPrefix = '__unsafe-lit-html-server-string__';

/**
 * Base class interface for Node/Attribute parts
 * @class Part
 */
export class Part {
  /**
   * Constructor
   */
  constructor() {
    this._value;
  }

  /**
   * Store the current value.
   * Used by directives to temporarily transfer value
   * (value will be deleted after reading).
   * @param {any} value
   */
  setValue(value) {
    this._value = value;
  }

  /**
   * Retrieve resolved value given passed value
   * @param {any} value
   * @returns {any}
   */
  getValue(value) {
    return value;
  }

  /**
   * No-op
   */
  commit() {}
}

/**
 * A dynamic template part for text nodes
 */
export class NodePart extends Part {
  /**
   * Retrieve HTML string from 'value'
   * @param {any} value
   * @returns {any}
   */
  getValue(value) {
    return resolveValue(value, this, true);
  }
}

/**
 * A dynamic template part for attributes.
 * Unlike text nodes, attributes may contain multiple strings and parts.
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
   * Retrieve HTML string from 'values'.
   * Resolves to a single string, or Promise for a single string,
   * even when responsible for multiple values.
   * @param {Array<any>} values
   * @returns {string|Promise<string>}
   */
  getValue(values) {
    const strings = this.strings;
    const endIndex = strings.length - 1;
    const result = [`${this.name}="`];
    let pending;

    for (let i = 0; i < endIndex; i++) {
      const string = strings[i];
      let value = resolveValue(values[i], this, false);

      result.push(string);

      // Bail if 'nothing'
      if (value === nothing) {
        return '';
      } else if (isPromise(value)) {
        if (pending === undefined) {
          pending = [];
        }

        const index = result.push(value) - 1;

        pending.push(
          value.then((value) => {
            result[index] = value;
          })
        );
      } else if (Array.isArray(value)) {
        result.push(value.join(''));
      } else {
        result.push(value);
      }
    }

    result.push(`${strings[endIndex]}"`);

    if (pending !== undefined) {
      // Flatten in case array returned from Promise
      return Promise.all(pending).then(() =>
        result.reduce((result, value) => result.concat(value), []).join('')
      );
    }
    return result.join('');
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
  getValue(values) {
    let value = values[0];

    if (isDirective(value)) {
      value = value(this);
    }

    if (isPromise(value)) {
      return value.then((value) => (value ? this.name : ''));
    }

    return value ? this.name : '';
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
  getValue(/* values */) {
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
  getValue(/* values */) {
    return '';
  }
}

/**
 * Resolve 'value' to string
 * @param {any} value
 * @param {NodePart} part
 * @param {boolean} ignoreNothingAndUndefined
 * @returns {any}
 */
function resolveValue(value, part, ignoreNothingAndUndefined = true) {
  if (isDirective(value)) {
    // Directives are synchronous, so it's safe to read and delete value
    value(part);
    value = part._value;
    part._value = undefined;
  }

  if (ignoreNothingAndUndefined && (value === nothing || value === undefined)) {
    return '';
  }

  // Pass-through template result
  if (isTemplateResult(value)) {
    return value;
  } else if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafeStringPrefix, otherwise strip prefix
    return isUnsafeString(string) ? string.slice(33) : escapeHTML(string);
  } else if (isPromise(value)) {
    return value.then((value) => resolveValue(value, part, ignoreNothingAndUndefined));
  } else if (isSyncIterator(value)) {
    if (!Array.isArray(value)) {
      value = Array.from(value);
    }
    return value.reduce((values, value) => {
      value = resolveValue(value, part, ignoreNothingAndUndefined);
      // Allow nested template results to also be flattened by not checking isTemplateResult
      if (Array.isArray(value)) {
        return values.concat(value);
      }
      values.push(value);
      return values;
    }, []);
  } else {
    return value;
  }
}
