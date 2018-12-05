import asyncHtmlTemplate from './streamHtmlTemplate.js';
import getStream from 'get-stream';
import htmlTemplateFactory from './htmlTemplate.js';
import { Readable } from 'readable-stream';
import { removeHeader } from './string.js';

export { directive } from './directive.js';
export { htmlTemplate as html, render, renderToString, htmlTemplate as svg };

const htmlTemplate = htmlTemplateFactory(asyncHtmlTemplate);

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
 * Render lit-html style HTML 'template' as string (via Promise)
 * @param {string|Readable} template
 * @returns {Promise<string>}
 */
function renderToString(template) {
  if (typeof template === 'string') {
    return Promise.resolve(removeHeader(template));
  }
  return getStream(template);
}
