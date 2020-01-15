import { Part } from '../index.js';

export const repeat: (
  items: Array<unknown>,
  keyFnOrTemplate: (item: unknown, index: number) => unknown,
  template?: (item: unknown, index: number) => unknown
) => (part: Part) => void;
