'use strict';

const htmlTemplate = require('./lib/htmlTemplate.js');
const { Readable } = require('readable-stream');
const { removeHeader } = require('./lib/string.js');

module.exports = {
  directive,
  html: htmlTemplate,
  render,
  svg: htmlTemplate
};

/**
 * Render lit-html style HTML 'template' as Readable stream
 * @param {string|Readable} template
 * @returns {Readable}
 */
function render(template) {
  // Force to stream
  if (typeof template === 'string') {
    // Strip header
    const str = removeHeader(template);
    let reads = 0;

    template = new Readable({
      read() {
        if (!reads++) {
          template.push(str, 'utf8');
        } else {
          template.push(null);
        }
      }
    });
  }

  return template;
}

/**
 * Define new directive for 'fn'
 * @param {function} fn
 * @returns {function}
 */
function directive(fn) {
  fn.isDirective = true;
  return fn;
}
