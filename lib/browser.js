'use strict';

const asyncHtmlTemplate = require('./promiseHtmlTemplate.js');
const { directive } = require('./directive.js');
const htmlTemplateFactory = require('./htmlTemplate.js');
const { removeHeader } = require('./string.js');

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
