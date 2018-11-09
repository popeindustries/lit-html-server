'use strict';

const { directive } = require('../lib/directive.js');
const { NO_ESCAPE } = require('../lib/string.js');

module.exports = {
  /**
   * Render unescaped HTML
   * @param {string} value
   * @returns {function}
   */
  unsafeHTML: directive((value) => (part) => {
    if (part.isAttribute) {
      throw Error('unsafeHTML can only be used in text bindings');
    }
    part.setValue(`${NO_ESCAPE}${value}`);
  })
};
