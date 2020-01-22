import { Part } from '../index.js';

export const guard: (value: unknown, fn: () => unknown) => (part: Part) => void;
