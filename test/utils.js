const stripWhitespace = require('normalize-html-whitespace');

module.exports = { normalizeWhitespace };

/**
 * Remove extra whitespaces from 'htmlString'
 * @param {string} htmlString
 * @returns {string}
 */
function normalizeWhitespace(htmlString) {
  return stripWhitespace(htmlString.trim());
}
