/**
 * @typedef Part { import('../parts.js').Part }
 */
import { directive } from '../index.js';

/**
 * Loop through 'items' and call 'template'.
 * No concept of efficient re-ordering possible in server context,
 * so this is a simple no-op map operation.
 *
 * @type { (items: Array<unknown>, keyFnOrTemplate: (item: unknown, index: number) => unknown, template?: (item: unknown, index: number) => unknown) => (part: Part) => void }
 */
export const repeat = directive((items, keyFnOrTemplate, template) => {
  if (template === undefined) {
    template = keyFnOrTemplate;
  }

  return (part) => {
    part.setValue(items.map((item, index) => template(item, index)));
  };
});
