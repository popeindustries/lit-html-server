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
   * @param {string} name
   * @param {Array<string>} strings
   * @returns {AttributePart}
   */
  handleAttributeExpressions(name, strings = []) {
    const prefix = name[0];

    if (prefix === '.') {
      return new PropertyAttributePart();
    }
    if (prefix === '@') {
      return new EventAttributePart();
    }
    if (prefix === '?') {
      return new BooleanAttributePart(name.slice(1), strings);
    }

    return new AttributePart(name, strings);
  }

  /**
   * Create part instance for text values
   * @returns {NodePart}
   */
  handleTextExpression() {
    return new NodePart();
  }
}
