import {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  NodePart,
  PropertyAttributePart
} from './parts.js';

/**
 * DefaultTemplateProcessor class
 */
export class DefaultTemplateProcessor {
  /**
   * Create part instance for attribute values
   * @param {Array<*>} values
   * @param {string} name
   * @param {Array<string>} strings
   * @returns {AttributePart|BooleanAttributePart|EventAttributePart|PropertyAttributePart}
   */
  handleAttributeExpressions(values, name, strings = []) {
    const prefix = name[0];

    if (prefix === '.') {
      return new PropertyAttributePart();
    }
    if (prefix === '@') {
      return new EventAttributePart();
    }
    if (prefix === '?') {
      if (values.length > 1 || strings.length > 0) {
        throw Error('boolean attributes can only have a single part');
      }
      return new BooleanAttributePart(values[0], name.slice(1), strings);
    }

    return new AttributePart(values, name, strings);
  }

  /**
   * Create part instance for text values
   * @param {*} value
   * @returns {NodePart}
   */
  handleTextExpression(value) {
    return new NodePart(value);
  }
}
