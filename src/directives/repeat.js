import { directive } from '../index.js';

/**
 * Loop through 'items' and call 'template'.
 * No concept of efficient re-ordering possible in server context,
 * so this is a simple no-op map operation.
 */
export const repeat = directive((items, keyFnOrTemplate, template) => {
  if (template === undefined) {
    template = keyFnOrTemplate;
  }

  const arrayItems = /** @type { Array<unknown> } */ (items);
  const tmpl = /** @type { (item: unknown, index: number) => unknown } */ (template);

  return (part) => {
    part.setValue(arrayItems.map((item, index) => tmpl(item, index)));
  };
});
