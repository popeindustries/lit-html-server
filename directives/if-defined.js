'use strict';

const { directive } = require('../lib/directive.js');
const { NULL_ATTRIBUTE } = require('../lib/string.js');

/**
 * Sets the attribute if 'value' is defined,
 * removes the attribute if undefined.
 * @param {any} value
 * @returns {() => void}
 */
module.exports = function ifDefined(value) {
  return directive((part) => {
    if (value === undefined && part.isAttribute) {
      part.setValue(NULL_ATTRIBUTE);
      return;
    }
    part.setValue(value);
  });
};
