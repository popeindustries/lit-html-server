'use strict';

const { directive } = require('../lib/directive.js');
const { NO_ESCAPE } = require('../lib/string.js');

module.exports = {
  /**
   * Render unescaped HTML
   * @param {any} value
   * @returns {() => void}
   */
  unsafeHTML(value) {
    return directive((part) => {
      if (typeof value !== 'string') {
        throw Error('The `unsafe-html` directive must be used on a string');
      }
      part.setValue(`${NO_ESCAPE}${value}`);
    });
  }
};
