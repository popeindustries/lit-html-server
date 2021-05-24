import { Part } from '../index';

export const repeat: (
  items: Array<unknown>,
  keyFnOrTemplate: (item: unknown, index: number) => unknown,
  template?: (item: unknown, index: number) => unknown,
) => (part: Part) => void;
