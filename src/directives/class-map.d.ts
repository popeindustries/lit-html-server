import { Part } from '../index';

export const classMap: (classInfo: { [name: string]: string | boolean | number }) => (part: Part) => void;
