import { directive } from '../directive.js';

/**
 * Loop through 'items' and call 'template'.
 * No concept of efficient re-ordering possible in server context,
 * so this is a simple no-op map operation.
 * @param {Array} items
 * @param {function} [keyFnOrTemplate]
 * @param {function) => any} template
 * @returns {function}
 */
export const repeat = directive((items, keyFnOrTemplate, template) => {
  if (template === undefined) {
    template = keyFnOrTemplate;
  }

  return (part) => {
    part.setValue(items.map((item, index) => template(item, index)));
  };
});
