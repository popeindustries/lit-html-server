/**
 * @typedef RenderOptions { import('./index.js).RenderOptions }
 */
import { emptyStringBuffer, nothingString, unsafePrefixString } from './string.js';
import { isAsyncIterator, isObject, isPrimitive, isPromise, isSyncIterator } from './is.js';
import { escape } from './escape.js';
import { isDirective } from './directive.js';
import { isTemplateResult } from './template-result.js';

/**
 * Determine if "part" is a NodePart
 *
 * @param { Part } part
 * @returns { boolean }
 */
export function isNodePart(part) {
  return (
    part instanceof NodePart ||
    (part && part.getValue !== undefined && typeof part.name === 'undefined')
  );
}

/**
 * Determine if "part" is an AttributePart
 *
 * @param { Part } part
 * @returns { boolean }
 */
export function isAttributePart(part) {
  return (
    part instanceof AttributePart ||
    (part && part.getValue !== undefined && typeof part.name !== 'undefined')
  );
}

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
   * @param { RenderOptions } [options]
   * @returns { any }
   */
  getValue(value /*, options */) {
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
   * @param { RenderOptions } [options]
   * @returns { any }
   */
  getValue(value /*, options */) {
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
   * @param { RenderOptions } [options]
   * @returns { Buffer|Promise<Buffer> }
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
        options !== undefined ? options.serializePropertyAttributes : false
      );

      // Bail if 'nothing'
      if (value === nothingString) {
        return emptyStringBuffer;
      }

      chunks.push(string);
      chunkLength += string.length;

      if (Buffer.isBuffer(value)) {
        chunks.push(value);
        chunkLength += value.length;
      } else if (isPromise(value)) {
        // Lazy init for uncommon scenario
        if (pendingChunks === undefined) {
          pendingChunks = [];
        }

        const index = chunks.push(value) - 1;

        pendingChunks.push(
          value.then((value) => {
            chunks[index] = value;
            chunkLength += value.length;
          })
        );
      } else if (Array.isArray(value)) {
        for (const chunk of value) {
          chunks.push(chunk);
          chunkLength += chunk.length;
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

    this.name = Buffer.from(this.name);

    if (
      strings.length !== 2 ||
      !strings[0] === emptyStringBuffer ||
      !strings[1] === emptyStringBuffer
    ) {
      throw Error('Boolean attributes can only contain a single expression');
    }
  }

  /**
   * Retrieve resolved string Buffer from passed "values".
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer|Promise<Buffer> }
   */
  getValue(values /*, options */) {
    let value = values[0];

    if (isDirective(value)) {
      value = resolveDirectiveValue(value, this);
    }

    if (isPromise(value)) {
      return value.then((value) => (value ? this.name : emptyStringBuffer));
    }

    return value ? this.name : emptyStringBuffer;
  }
}

/**
 * A dynamic template part for property attributes.
 * Property attributes are prefixed with "."
 */
export class PropertyAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Returns an empty string unless "options.serializePropertyAttributes=true"
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer }
   */
  getValue(values, options) {
    if (options !== undefined && options.serializePropertyAttributes) {
      const value = super.getValue(values, options);
      const prefix = Buffer.from('.');

      return value instanceof Promise
        ? value.then((value) => Buffer.concat([prefix, value]))
        : Buffer.concat([prefix, value]);
    }

    return emptyStringBuffer;
  }
}

/**
 * A dynamic template part for event attributes.
 * Event attributes are prefixed with "@"
 */
export class EventAttributePart extends AttributePart {
  /**
   * Retrieve resolved string Buffer from passed "values".
   * Event bindings have no server-side representation,
   * so always returns an empty string.
   *
   * @param { Array<unknown> } values
   * @param { RenderOptions } [options]
   * @returns { Buffer }
   */
  getValue(/* values, options */) {
    return emptyStringBuffer;
  }
}

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

  if (value === nothingString) {
    return value;
  }

  if (isTemplateResult(value)) {
    value = value.read();
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    return Buffer.from(
      string.indexOf(unsafePrefixString) === 0 ? string.slice(33) : escape(string, 'attribute')
    );
  } else if (Buffer.isBuffer(value)) {
    return value;
  } else if (serialiseObjectsAndArrays && (isObject(value) || Array.isArray(value))) {
    return Buffer.from(escape(JSON.stringify(value), 'attribute'));
  } else if (isPromise(value)) {
    return value.then((value) => resolveAttributeValue(value, part, serialiseObjectsAndArrays));
  } else if (isSyncIterator(value)) {
    if (!Array.isArray(value)) {
      value = Array.from(value);
    }
    return Buffer.concat(
      value.reduce((values, value) => {
        value = resolveAttributeValue(value, part, serialiseObjectsAndArrays);
        // Flatten
        if (Array.isArray(value)) {
          return values.concat(value);
        }
        values.push(value);
        return values;
      }, [])
    );
  } else {
    throw Error('unknown AttributPart value', value);
  }
}

/**
 * Resolve "value" to string Buffer if possible
 *
 * @param { unknown } value
 * @param { NodePart } part
 * @returns { any }
 */
function resolveNodeValue(value, part) {
  if (isDirective(value)) {
    value = resolveDirectiveValue(value, part);
  }

  if (value === nothingString || value === undefined) {
    return emptyStringBuffer;
  }

  if (isPrimitive(value)) {
    const string = typeof value !== 'string' ? String(value) : value;
    // Escape if not prefixed with unsafePrefixString, otherwise strip prefix
    return Buffer.from(
      string.indexOf(unsafePrefixString) === 0
        ? string.slice(33)
        : escape(
            string,
            part.tagName === 'script' || part.tagName === 'style' ? part.tagName : 'text'
          )
    );
  } else if (isTemplateResult(value) || Buffer.isBuffer(value)) {
    return value;
  } else if (isPromise(value)) {
    return value.then((value) => resolveNodeValue(value, part));
  } else if (isSyncIterator(value)) {
    if (!Array.isArray(value)) {
      value = Array.from(value);
    }
    return value.reduce((values, value) => {
      value = resolveNodeValue(value, part);
      // Flatten
      if (Array.isArray(value)) {
        return values.concat(value);
      }
      values.push(value);
      return values;
    }, []);
  } else if (isAsyncIterator(value)) {
    return resolveAsyncIteratorValue(value, part);
  } else {
    throw Error('unknown NodePart value', value);
  }
}

/**
 * Resolve values of async "iterator"
 *
 * @param { AsyncIterator } iterator
 * @param { NodePart } part
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
