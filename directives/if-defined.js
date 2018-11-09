'use strict';

const { directive } = require('../lib/directive.js');
const { NULL_ATTRIBUTE } = require('../lib/string.js');

module.exports = {
  /**
   * Sets the attribute if 'value' is defined,
   * removes the attribute if undefined.
   * @param {*} value
   * @returns {function}
   */
  ifDefined: directive((value) => (part) => {
    if (value === undefined && part.isAttribute) {
      part.setValue(NULL_ATTRIBUTE);
      return;
    }
    part.setValue(value);
  })
};
