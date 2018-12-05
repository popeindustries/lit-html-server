import asyncHtmlTemplate from './promiseHtmlTemplate.js';
import htmlTemplateFactory from './htmlTemplate.js';
import { removeHeader } from './string.js';

export { directive } from './directive.js';
export { htmlTemplate as html, renderToString, htmlTemplate as svg };

const htmlTemplate = htmlTemplateFactory(asyncHtmlTemplate);

/**
 * Render lit-html style HTML 'template' as string (via Promise)
 * @param {string|Promise<string>} template
 * @returns {Promise<string>}
 */
function renderToString(template) {
  if (typeof template === 'string') {
    template = Promise.resolve(template);
  }
  return template.then((string) => removeHeader(string));
}
