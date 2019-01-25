import { isPrimitive, isPromise, isSyncIterator } from './is.js';
import escapeHTML from './escape.js';
import { isDirective } from './directive.js';
import { isTemplateResult } from './template-result.js';

/**
 * A value for strings that signals a Part to clear its content
 */
export const nothingString = '__nothing-lit-html-server-string__';

/**
 * A prefix value for strings that should not be escaped
 */
export const unsafeStringPrefix = '__unsafe-lit-html-server-string__';

/**
 * Base class interface for Node/Attribute parts
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
   *
   * @param { any } value
   */
  setValue(value) {
    this._value = value;
  }

  /**
   * Retrieve resolved string from passed "value"
   *
   * @param { any } value
   * @returns { any }
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
   * Retrieve resolved value given passed "value"
   *
   * @param { any } value
   * @returns { any }
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
   *
   * @param { string } name
   * @param { Array<string> } strings
   */
  constructor(name, strings) {
    super();
    this.name = name;
    this.strings = strings;
    this.length = strings.length - 1;
  }

  /**
   * Retrieve resolved string from passed "values".
   * Resolves to a single string, or Promise for a single string,
   * even when responsible for multiple values.
   *
   * @param { Array<any> } values
   * @returns { string|Promise<string> }
   */
  getValue(values) {
    const strings = this.strings;
    const endIndex = strings.length - 1;
    let buffer = `${this.name}="`;
    let chunks, pending;

    for (let i = 0; i < endIndex; i++) {
      const string = strings[i];
      let value = resolveValue(values[i], this, false);

      buffer += string;

      // Bail if 'nothing'
      if (value === nothingString) {
        return '';
      } else if (isPromise(value)) {
        if (chunks === undefined) {
          chunks = [];
          pending = [];
        }

        chunks.push(buffer);
        buffer = '';
        const index = chunks.push(value) - 1;

        pending.push(
          value.then((value) => {
            chunks[index] = value;
          })
        );
      } else if (Array.isArray(value)) {
        buffer += value.join('');
      } else {
        buffer += value;
      }
    }

    buffer += `${strings[endIndex]}"`;

    if (pending !== undefined) {
      chunks.push(buffer);
      // Flatten in case array returned from Promise
      return Promise.all(pending).then(() =>
        chunks.reduce((chunks, value) => chunks.concat(value), []).join('')
      );
    }
    return buffer;
  }
}

/**
 * A dynamic template part for boolean attributes.
 * Boolean attributes are prefixed with "?"
 */
export class BooleanAttributePart extends AttributePart {
  /**
   * Constructor
   *
   * @param { string } name
   * @param { Array<string> } strings
   * @throws error when multiple expressions
   */
  constructor(name, strings) {
    super(name, strings);

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw Error('Boolean attributes can only contain a single expression');
    }
  }

  /**
   * Retrieve resolved string from passed "values".
   *
   * @param { Array<any> } values
   * @returns { string|Promise<string> }
   */
  getValue(values) {
    let value = values[0];

    if (isDirective(value)) {
      value = getDirectiveValue(value, this);
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
   * Retrieve resolved string from passed "values".
   * Properties have no server-side representation,
   * so always returns an empty string.
   *
   * @param { Array<any> } values
   * @returns { string }
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
   * Retrieve resolved string from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   *
   * @param { Array<any> } values
   * @returns { string }
   */
  getValue(/* values */) {
    return '';
  }
}

/**
 * Resolve "value" to string if possible
 *
 * @param { any } value
 * @param { Part } part
 * @param { boolean } ignoreNothingAndUndefined
 * @returns { any }
 */
function resolveValue(value, part, ignoreNothingAndUndefined = true) {
  if (isDirective(value)) {
    value = getDirectiveValue(value, part);
  }

  if (ignoreNothingAndUndefined && (value === nothingString || value === undefined)) {
    return '';
  }

  // Pass-through template result
  if (isTemplateResult(value)) {
    return value;
  } else if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafeStringPrefix, otherwise strip prefix
    return string.indexOf(unsafeStringPrefix) === 0 ? string.slice(33) : escapeHTML(string);
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

/**
 * Retrieve value from "directive"
 *
 * @param { function } directive
 * @param { Part } part
 * @returns { any }
 */
function getDirectiveValue(directive, part) {
  // Directives are synchronous, so it's safe to read and delete value
  directive(part);
  const value = part._value;
  part._value = undefined;
  return value;
}
