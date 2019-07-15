import { directive } from '../index.js';

export const repeat = directive(repeatDirective);

/**
 * Loop through 'items' and call 'template'.
 * No concept of efficient re-ordering possible in server context,
 * so this is a simple no-op map operation.
 *
 * @param { Array<unknown> } items
 * @param { function } keyFnOrTemplate
 * @param { (item: unknown, index: number) => TemplateResult } [template]
 * @returns { (part: Part) => void }
 */
function repeatDirective(items, keyFnOrTemplate, template) {
  if (template === undefined) {
    template = keyFnOrTemplate;
  }

  return function(part) {
    part.setValue(items.map((item, index) => template(item, index)));
  };
}
