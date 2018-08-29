'use strict';

const { encode } = require('he');

const HEADER = '<!-- lit-html-server -->';

module.exports = {
  HEADER,
  addHeader,
  hasHeader,
  removeHeader,
  sanitize
};

/**
 *
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
 *
 * @param {string} str
 * @returns {boolean}
 */
function hasHeader(str) {
  return typeof str === 'string' && str.indexOf(HEADER) === 0;
}

/**
 *
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
 *
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
  return encode(str);
}
