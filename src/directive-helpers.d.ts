/* import { ChildPart, Part, TemplateResult } from './index'; */
/* import { DirectiveResult, DirectiveClass, PartInfo } from './directive'; */

/* export  */ declare const TemplateResultType: {
  readonly HTML: 1;
  readonly SVG: 2;
};
/* export  */ declare type TemplateResultType = typeof TemplateResultType[keyof typeof TemplateResultType];

/**
 * Tests if a value is a primitive value.
 *
 * See https://tc39.github.io/ecma262/#sec-typeof-operator
 */
/* export  */ declare const isPrimitive: (
  value: unknown,
) => value is string | number | bigint | boolean | symbol | null | undefined;
/**
 * Tests if a value is a TemplateResult.
 */
/* export  */ declare const isTemplateResult: (
  value: unknown,
  type?: 1 | 2 | undefined,
) => value is TemplateResult<1 | 2>;
/**
 * Tests if a value is a DirectiveResult.
 */
/* export  */ declare const isDirectiveResult: (value: unknown) => value is DirectiveResult<DirectiveClass>;
/**
 * Retrieves the Directive class for a DirectiveResult
 */
/* export  */ declare const getDirectiveClass: (value: unknown) => DirectiveClass | undefined;
/**
 * Tests whether a part has only a single-expression with no strings to
 * interpolate between.
 *
 * Only AttributePart and PropertyPart can have multiple expressions.
 * Multi-expression parts have a `strings` property and single-expression
 * parts do not.
 */
/* export  */ declare const isSingleExpression: (part: PartInfo) => boolean;

/**
 * Inserts a ChildPart into the given container ChildPart, either at the
 * end of the container ChildPart, or before the optional `refPart`.
 */
/* export  */ declare const insertPart: (containerPart: ChildPart, refPart?: ChildPart, part?: ChildPart) => ChildPart;
/**
 * Sets the value of a Part.
 */
/* export  */ declare const setChildPartValue: <T extends ChildPart>(part: T, value: unknown) => T;
/**
 * Sets the committed value of a ChildPart directly without triggering the
 * commit stage of the part.
 */
/* export  */ declare const setCommittedValue: (part: Part, value?: unknown) => unknown;
/**
 * Returns the committed value of a ChildPart.
 */
/* export  */ declare const getCommittedValue: (part: ChildPart) => unknown;
/**
 * Removes a ChildPart from the DOM, including any of its content.
 */
/* export  */ declare const removePart: (part: ChildPart) => void;
/* export  */ declare const clearPart: (part: ChildPart) => void;
