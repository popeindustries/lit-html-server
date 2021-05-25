import { isArray, isAsyncIterator, isBuffer, isObject, isPrimitive, isPromise, isSyncIterator } from './is.js';
import { isDirective, isTemplateResult } from './is.js';
import { nothing, unsafePrefixString } from './shared.js';
import { Buffer } from 'buffer';
import { escape } from './escape.js';

const EMPTY_STRING_BUFFER = Buffer.from('');

/**
 * Base class interface for Node/Attribute parts
 */
export class Part {
  /**
   * Constructor
   *
   * @param { string } tagName
   */
  constructor(tagName) {
    this.tagName = tagName;
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
   * @param { _lit.RenderOptions } [options]
   * @returns { any }
   */
  getValue(value, options) {
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
export class ChildPart extends Part {
  /**
   * Retrieve resolved value given passed "value"
   *
   * @param { any } value
   * @param { _lit.RenderOptions } [options]
   * @returns { any }
   */
  getValue(value, options) {
    return resolveNodeValue(value, this);
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
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   */
  constructor(name, strings, tagName) {
    super(tagName);
    this.name = name;
    this.strings = strings;
    this.length = strings.length - 1;
    this.prefix = Buffer.from(`${this.name}="`);
    this.suffix = Buffer.from(`${this.strings[this.length]}"`);
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   * Resolves to a single string, or Promise for a single string,
   * even when responsible for multiple values.
   *
   * @param { Array<unknown> } values
   * @param { _lit.RenderOptions } [options]
   * @returns { Buffer | Promise<Buffer> }
   */
  getValue(values, options) {
    let chunks = [this.prefix];
    let chunkLength = this.prefix.length;
    let pendingChunks;

    for (let i = 0; i < this.length; i++) {
      const string = this.strings[i];
      let value = resolveAttributeValue(
        values[i],
        this,
        options !== undefined ? options.serializePropertyAttributes : false,
      );

      // Bail if 'nothing'
      if (value === nothing) {
        return EMPTY_STRING_BUFFER;
      }

      chunks.push(string);
      chunkLength += string.length;

      if (isBuffer(value)) {
        chunks.push(value);
        chunkLength += value.length;
      } else if (isPromise(value)) {
        // Lazy init for uncommon scenario
        if (pendingChunks === undefined) {
          pendingChunks = [];
        }

        // @ts-ignore
        const index = chunks.push(value) - 1;

        pendingChunks.push(
          value.then((value) => {
            // @ts-ignore
            chunks[index] = value;
            // @ts-ignore
            chunkLength += value.length;
          }),
        );
      } else if (isArray(value)) {
        for (const chunk of value) {
          const buffer = /** @type { Buffer } */ (chunk);
          chunks.push(buffer);
          chunkLength += buffer.length;
        }
      }
    }

    chunks.push(this.suffix);
    chunkLength += this.suffix.length;
    if (pendingChunks !== undefined) {
      return Promise.all(pendingChunks).then(() => Buffer.concat(chunks, chunkLength));
    }
    return Buffer.concat(chunks, chunkLength);
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
   * @param { Array<Buffer> } strings
   * @param { string } tagName
   * @throws error when multiple expressions
   */
  constructor(name, strings, tagName) {
    super(name, strings, tagName);

    this.nameAsBuffer = Buffer.from(this.name);

    if (strings.length !== 2 || strings[0] === EMPTY_STRING_BUFFER || strings[1] === EMPTY_STRING_BUFFER) {
      throw Error('Boolean attributes can only contain a single expression');
    }
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   *
   * @param { Array<unknown> } values
   * @param { _lit.RenderOptions } [options]
   * @returns { Buffer | Promise<Buffer> }
   */
  getValue(values, options) {
    let value = values[0];

    if (isDirective(value)) {
      value = resolveDirectiveValue(value, this);
    }

    if (isPromise(value)) {
      return value.then((value) => (value ? this.nameAsBuffer : EMPTY_STRING_BUFFER));
    }

    return value ? this.nameAsBuffer : EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
export class PropertyPart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Returns an empty string unless "options.serializePropertyAttributes=true"
   *
   * @param { Array<unknown> } values
   * @param { _lit.RenderOptions } [options]
   * @returns { Buffer | Promise<Buffer> }
   */
  getValue(values, options) {
    if (options !== undefined && options.serializePropertyAttributes) {
      const value = super.getValue(values, options);
      const prefix = Buffer.from('.');

      return value instanceof Promise
        ? value.then((value) => Buffer.concat([prefix, value]))
        : Buffer.concat([prefix, value]);
    }

    return EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
export class EventPart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   *
   * @param { Array<unknown> } values
   * @param { _lit.RenderOptions } [options]
   * @returns { Buffer }
   */
  getValue(values, options) {
    return EMPTY_STRING_BUFFER;
  }
}

/**
 * A dynamic template part for accessing element instances.
 */
export class ElementPart extends EventPart {}

/**
 * Resolve "value" to string if possible
 *
 * @param { unknown } value
 * @param { AttributePart } part
 * @param { boolean } [serialiseObjectsAndArrays]
 * @returns { any }
 */
function resolveAttributeValue(value, part, serialiseObjectsAndArrays = false) {
  if (isDirective(value)) {
    value = resolveDirectiveValue(value, part);
  }

  if (value === nothing) {
    return value;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    return Buffer.from(string.indexOf(unsafePrefixString) === 0 ? string.slice(33) : escape(string, 'attribute'));
  } else if (isBuffer(value)) {
    return value;
  } else if (serialiseObjectsAndArrays && (isObject(value) || isArray(value))) {
    return Buffer.from(escape(JSON.stringify(value), 'attribute'));
  } else if (isPromise(value)) {
    return value.then((value) => resolveAttributeValue(value, part, serialiseObjectsAndArrays));
  } else if (isSyncIterator(value)) {
    if (!isArray(value)) {
      value = Array.from(value);
    }
    return Buffer.concat(
      // @ts-ignore: already converted to Array
      value.reduce((values, value) => {
        value = resolveAttributeValue(value, part, serialiseObjectsAndArrays);
        // Flatten
        if (isArray(value)) {
          return values.concat(value);
        }
        values.push(value);
        return values;
      }, []),
    );
  } else {
    return Buffer.from(String(value));
  }
}

/**
 * Resolve "value" to string Buffer if possible
 *
 * @param { unknown } value
 * @param { ChildPart } part
 * @returns { any }
 */
function resolveNodeValue(value, part) {
  if (isDirective(value)) {
    value = resolveDirectiveValue(value, part);
  }

  if (value === nothing || value === undefined) {
    return EMPTY_STRING_BUFFER;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    return Buffer.from(
      string.indexOf(unsafePrefixString) === 0
        ? string.slice(33)
        : escape(string, part.tagName === 'script' || part.tagName === 'style' ? part.tagName : 'text'),
    );
  } else if (isTemplateResult(value) || isBuffer(value)) {
    return value;
  } else if (isPromise(value)) {
    return value.then((value) => resolveNodeValue(value, part));
  } else if (isSyncIterator(value)) {
    if (!isArray(value)) {
      value = Array.from(value);
    }
    // @ts-ignore: already converted to Array
    return value.reduce((values, value) => {
      value = resolveNodeValue(value, part);
      // Flatten
      if (isArray(value)) {
        return values.concat(value);
      }
      values.push(value);
      return values;
    }, []);
  } else if (isAsyncIterator(value)) {
    return resolveAsyncIteratorValue(value, part);
  } else {
    throw Error(`unknown NodePart value: ${value}`);
  }
}

/**
 * Resolve values of async "iterator"
 *
 * @param { AsyncIterable<unknown> } iterator
 * @param { ChildPart } part
 * @returns { AsyncGenerator }
 */
async function* resolveAsyncIteratorValue(iterator, part) {
  for await (const value of iterator) {
    yield resolveNodeValue(value, part);
  }
}

/**
 * Resolve value of "directive"
 *
 * @param { function } directive
 * @param { Part } part
 * @returns { unknown }
 */
function resolveDirectiveValue(directive, part) {
  // Directives are synchronous, so it's safe to read and delete value
  directive(part);
  const value = part._value;
  part._value = undefined;
  return value;
}
