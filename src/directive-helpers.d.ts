/* import { ChildPart, Part, TemplateResult } from './index'; */
/* import { DirectiveResult, DirectiveClass, PartInfo } from './directive'; */

/* export  */ declare const TemplateResultType: {
  readonly HTML: 1;
  readonly SVG: 2;
};
/* export  */ declare type TemplateResultType = typeof TemplateResultType[keyof typeof TemplateResultType];

/**
 * Tests if a value is a primitive value
 *
 * See https://tc39.github.io/ecma262/#sec-typeof-operator
 */
/* export  */ declare function isPrimitive(
  value: unknown,
): value is string | number | bigint | boolean | symbol | null | undefined;
/**
 * Tests if a value is a TemplateResult
 */
/* export  */ declare function isTemplateResult(
  value: unknown,
  type?: 1 | 2 | undefined,
): value is TemplateResult<1 | 2>;
/**
 * Tests if a value is a DirectiveResult.
 */
/* export  */ declare function isDirectiveResult(value: unknown): value is DirectiveResult<DirectiveClass>;
/**
 * Retrieves the Directive class for a DirectiveResult
 */
/* export  */ declare function getDirectiveClass(value: unknown): DirectiveClass | undefined;
/**
 * Tests whether a part has only a single-expression with no strings to
 * interpolate between.
 *
 * Only AttributePart and PropertyPart can have multiple expressions.
 */
/* export  */ declare function isSingleExpression(part: PartInfo): boolean;
