import stripWhitespace from 'normalize-html-whitespace';

export { normalizeWhitespace };

/**
 * Remove extra whitespaces from 'htmlString'
 * @param {string} htmlString
 * @returns {string}
 */
function normalizeWhitespace(htmlString) {
  return stripWhitespace(htmlString.trim());
}
