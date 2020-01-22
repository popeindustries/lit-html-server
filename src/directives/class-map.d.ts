import { Part } from '../index.js';

export const classMap: (classInfo: {
  [name: string]: string | boolean | number;
}) => (part: Part) => void;
