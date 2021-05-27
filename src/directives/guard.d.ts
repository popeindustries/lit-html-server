import { Part } from '../index';

export const guard: (value: unknown, fn: () => unknown) => (part: Part) => void;
