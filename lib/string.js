import he from 'he';

const ASYNC_PLACEHOLDER = '{__async__}';
const HEADER = '<!-- lit-html-server -->';
const NO_ESCAPE = '<!-- no escape -->';
const NULL_ATTRIBUTE = '{__null__}';
const RE_ENCODED = /&#x/;

export {
  ASYNC_PLACEHOLDER,
  HEADER,
  addHeader,
  emptyArray,
  hasHeader,
  NO_ESCAPE,
  NULL_ATTRIBUTE,
  removeHeader,
  sanitize
};

/**
 * Add header to 'str'
 * @param {string} str
 * @returns {string}
 */
function addHeader(str) {
  if (hasHeader(str)) {
    return str;
  }
  return `${HEADER}${str}`;
}

/**
 * Return an array of 'length' filled with empty strings
 * This is compatible with engines that don't support Array.prototype.fill()
 * @param {number} length
 * @returns {*[]}
 */
function emptyArray(length) {
  const array = [];

  for (let i = 0; i < length; i++) {
    array[i] = '';
  }

  return array;
}

/**
 * Determine if 'str' has header
 * @param {string} str
 * @returns {boolean}
 */
function hasHeader(str) {
  return typeof str === 'string' && str.indexOf(HEADER) === 0;
}

/**
 * Remove header from 'str'
 * @param {string} str
 * @returns {string}
 */
function removeHeader(str) {
  if (!hasHeader(str)) {
    return str;
  }
  return str.slice(24);
}

/**
 * Remove header from 'str' if present,
 * or encode 'str' for html
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  if (typeof str !== 'string') {
    return str;
  }
  if (hasHeader(str)) {
    return str.slice(24);
  }
  if (str.indexOf(NO_ESCAPE) === 0) {
    return str.slice(18);
  }

  // Prevent multiple encodes
  return RE_ENCODED.test(str) ? str : he.encode(str);
}
