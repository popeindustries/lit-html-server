'use strict';

const { directive } = require('../index.js');
const { NO_ESCAPE } = require('../lib/string.js');

/**
 * Render unescaped HTML
 * @param {any} value
 * @returns {() => void}
 */
module.exports = function unsafeHTML(value) {
  return directive((part) => {
    part.setValue(`${NO_ESCAPE}${value}`);
  });
};
