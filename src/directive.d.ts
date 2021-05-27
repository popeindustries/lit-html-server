/* export { AttributePart, BooleanAttributePart, ChildPart, ElementPart, EventPart, Part } from './index'; */

/* export  */ declare const PartType: {
  readonly ATTRIBUTE: 1;
  readonly CHILD: 2;
  readonly PROPERTY: 3;
  readonly BOOLEAN_ATTRIBUTE: 4;
  readonly EVENT: 5;
  readonly ELEMENT: 6;
};
/* export  */ declare type PartType = typeof PartType[keyof typeof PartType];
/* export  */ declare interface ChildPartInfo {
  readonly type: typeof PartType.CHILD;
}
/* export  */ declare interface AttributePartInfo {
  readonly type:
    | typeof PartType.ATTRIBUTE
    | typeof PartType.PROPERTY
    | typeof PartType.BOOLEAN_ATTRIBUTE
    | typeof PartType.EVENT;
  readonly strings?: ReadonlyArray<string>;
  readonly name: string;
  readonly tagName: string;
}
/* export  */ declare interface ElementPartInfo {
  readonly type: typeof PartType.ELEMENT;
}
/* export */ declare type PartInfo = ChildPartInfo | AttributePartInfo | ElementPartInfo;

/* export  */ declare interface DirectiveClass {
  new (part: PartInfo): Directive;
}
/* export */ declare type DirectiveParameters<C extends Directive> = Parameters<C['render']>;
/* export */ interface DirectiveResult<C extends DirectiveClass = DirectiveClass> {
  _$litDirective$: C;
  values: DirectiveParameters<InstanceType<C>>;
}
/* export */ declare const directive: <C extends DirectiveClass>(
  c: C,
) => (...values: Parameters<InstanceType<C>['render']>) => DirectiveResult<C>;
/* export */ declare abstract class Directive {
  constructor(_partInfo: PartInfo);
  render(...props: Array<unknown>): unknown;
  update(_part: Part, props: Array<unknown>): unknown;
}
