/**
 * Tests if a value is a primitive value
 *
 * @see https://tc39.github.io/ecma262/#sec-typeof-operator
 * @param { unknown } value
 * @returns { value is null | undefined | boolean | number | string | symbol | bigint }
 */
export function isPrimitive(value) {
  return value === null || (typeof value != 'object' && typeof value != 'function');
}

/**
 * Tests if a value is a TemplateResult
 *
 * @param { unknown } value
 * @param { TemplateResultType } type
 * @returns { value is TemplateResult }
 */
export function isTemplateResult(value, type) {
  return value !== undefined && type === undefined
    ? /** @type { TemplateResult } */ (value)._type !== undefined
    : /** @type { TemplateResult } */ (value)._type === type;
}

/**
 * Tests if a value is a DirectiveResult
 *
 * @param { unknown } value
 * @returns { value is DirectiveResult }
 */
export function isDirectiveResult(value) {
  return value !== undefined && /** @type { DirectiveResult } */ (value)._type !== undefined;
}

/**
 * Retrieves the Directive class for a DirectiveResult
 *
 * @param { unknown } value
 * @returns { DirectiveClass | undefined }
 */
export function getDirectiveClass(value) {
  if (value) {
    return /** @type { DirectiveResult } */ (value)._type;
  }
}

/**
 * Tests whether a part has only a single-expression with no strings to
 * interpolate between.
 *
 * Only AttributePart and PropertyPart can have multiple expressions.
 * Multi-expression parts have a `strings` property and single-expression
 * parts do not.
 *
 * @param { PartInfo } part
 */
export function isSingleExpression(part) {
  return 'strings' in part && /** @type { AttributePartInfo } */ (part).strings.length > 0;
}
