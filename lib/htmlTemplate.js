'use strict';

const { addHeader, sanitize } = require('./string.js');
const streamTemplate = require('./streamTemplate.js');

const PLACEHOLDER = '{__async__}';
// https://github.com/Polymer/lit-html/blob/be84d43f446f22fdd4d44201155b60cf35318912/src/lib/template.ts#L244
// eslint-disable-next-line no-control-regex
const RE_ATTRIBUTE_NAME = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;

/**
 * Tagged template processor for HTML templates (based on lit-html syntax).
 * Returns string for synchronous value types,
 * or a Readable stream if asynchronous (Readable, Promise).
 * @param {[string]} strings
 * @param {...string|number|boolean|Array|Promise|Readable} values
 * @returns {string|Readable}
 */
module.exports = function htmlTemplate(strings, ...values) {
  // Prefix with header so we can distinguish between nested template results
  // and primitive values that should be escaped (via sanitize()).
  let html = addHeader(strings[0]);
  let asyncValues;

  for (let i = 0, n = values.length; i < n; i++) {
    let string = strings[i + 1];
    let value = values[i];

    // Treat Array as nested template in order to correctly handle all types
    if (Array.isArray(value)) {
      value = htmlTemplate(Array(value.length + 1).fill(''), ...value);
    }

    // In attribute mode if an element tag is currently open
    const isAttributeMode = isTagOpen(html);
    // Async if Promise, Readable, or Iterator
    // TODO: add (async) iterator support
    // (typeof value[Symbol.iterator] === 'function' && value.next !== undefined)
    const isAsyncValue = value != null && (value.then !== undefined || value.pipe !== undefined);

    if (isAsyncValue) {
      if (isAttributeMode) {
        throw Error(
          `only synchronous values are valid when interpolating element attributes: ${html.slice(
            Math.min(html.length, 10) * -1
          )}\${[${typeof value}]}${string.slice(0, Math.min(string.length, 10))}`
        );
      }
      asyncValues = asyncValues || [];
      asyncValues.push(value);
      value = PLACEHOLDER;
    } else if (isAttributeMode) {
      const attributeNameMatch = RE_ATTRIBUTE_NAME.exec(html);

      if (attributeNameMatch !== null && attributeNameMatch[1] !== undefined) {
        const attributeName = attributeNameMatch[1];
        const specialAttributeFlag = attributeName.charAt(0);
        const hasLeadingQuote = isQuoteChar(
          html.charAt(attributeNameMatch.index + attributeName.length + 2)
        );

        // Handle special argument prefixes
        if (
          specialAttributeFlag === '?' ||
          specialAttributeFlag === '.' ||
          specialAttributeFlag === '@'
        ) {
          // Remove name, '=', and quote if it is present
          html = html.slice(0, attributeNameMatch.index + 1);
          if (specialAttributeFlag === '?' && value) {
            html += attributeName.slice(1);
          }
          value = '';
          // Remove trailing quote
          if (isQuoteChar(string.charAt(0))) {
            string = string.slice(1);
          }
        } else {
          // Escape
          value = sanitize(value);
          // Add missing quotes
          if (!hasLeadingQuote) {
            value = `"${value}"`;
          }
        }
      }
    } else {
      // Remove header from nested template or escape
      value = sanitize(value);
    }

    html += value;
    html += string;
  }

  // Return stream if async values
  if (asyncValues && asyncValues.length > 0) {
    return streamTemplate(html.split(PLACEHOLDER), ...asyncValues);
  }

  return html;
};

/**
 * Determine if last element tag in 'str' is open
 * @param {string} str
 * @returns {boolean}
 */
function isTagOpen(str) {
  const close = str.lastIndexOf('>');

  return str.indexOf('<', close + 1) > -1;
}

/**
 * Determine if 'char' is quote character
 * @param {string} char
 * @returns {boolean}
 */
function isQuoteChar(char) {
  return char === "'" || char === '"';
}
