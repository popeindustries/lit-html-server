/**
 * @typedef { Array<string|Promise<any>> } templateResult - an array of template strings (or Promises) and their resolved values
 * @property { boolean } isTemplateResult
 */
/**
 * @typedef TemplateResultProcessor { import('./default-template-result-processor.js').TemplateResultProcessor }
 */
/**
 * Determine if 'obj' is a template result
 *
 * @param { any } obj
 * @returns { boolean }
 */
export function isTemplateResult(obj) {
  return Array.isArray(obj) && obj.isTemplateResult;
}

/**
 * Reduce a Template's strings and values to an array of resolved strings (or Promises)
 *
 * @param { Template } template
 * @param { Array<any> } values
 * @param { TemplateResultProcessor } processor
 * @returns { templateResult }
 */
export function templateResult(template, values, processor) {
  const result = processor.processTemplate(template, values);

  result.isTemplateResult = true;
  return result;
}
