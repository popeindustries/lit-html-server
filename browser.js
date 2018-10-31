'use strict';

const asyncHtmlTemplate = require('./lib/promiseHtmlTemplate.js');
const { directive } = require('./lib/directive.js');
const htmlTemplateFactory = require('./lib/htmlTemplate.js');
const { removeHeader } = require('./lib/string.js');

const htmlTemplate = htmlTemplateFactory(asyncHtmlTemplate);

module.exports = {
  directive,
  html: htmlTemplate,
  renderToString,
  svg: htmlTemplate
};

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
