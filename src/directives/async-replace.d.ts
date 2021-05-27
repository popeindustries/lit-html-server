import { Part } from '../index';

export declare const asyncReplace: (
  value: AsyncIterable<unknown>,
  mapper?: ((v: unknown, index?: number | undefined) => unknown) | undefined,
) => (part: Part) => void;
