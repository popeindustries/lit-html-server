/**
 * Determine if 'obj' is a template result
 * @param {any} obj
 * @returns {boolean}
 */
export function isTemplateResult(obj) {
  return Array.isArray(obj) && obj.isTemplateResult;
}

/**
 *
 * @param {Template} template
 * @param {Array<any>} values
 * @param {(template: Template, values: Array<any>) => Array<string|Promise<any>>} processor
 * @returns {Array<string|Promise<any>>}
 */
export function templateResult(template, values, processor) {
  const result = processor.processTemplate(template, values);

  result.isTemplateResult = true;
  return result;
}
