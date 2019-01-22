/**
 * @typedef TemplateProcessor
 * @property { (name: string, strings: Array<string>) => AttributePart } handleAttributeExpressions
 * @property { () => NodePart } handleTextExpression
 */
import {
  AttributePart,
  BooleanAttributePart,
  EventAttributePart,
  NodePart,
  PropertyAttributePart
} from './parts.js';

/**
 * Class representing the default Template processor.
 * Exposes factory functions for generating Part instances to use for
 * resolving a template's dynamic values.
 */
export class DefaultTemplateProcessor {
  /**
   * Create part instance for dynamic attribute values
   *
   * @param { string } name
   * @param { Array<string> } strings
   * @returns { AttributePart }
   */
  handleAttributeExpressions(name, strings = []) {
    const prefix = name[0];

    if (prefix === '.') {
      return new PropertyAttributePart(name.slice(1), strings);
    } else if (prefix === '@') {
      return new EventAttributePart(name.slice(1), strings);
    } else if (prefix === '?') {
      return new BooleanAttributePart(name.slice(1), strings);
    }

    return new AttributePart(name, strings);
  }

  /**
   * Create part instance for dynamic text values
   *
   * @returns { NodePart }
   */
  handleTextExpression() {
    return new NodePart();
  }
}
