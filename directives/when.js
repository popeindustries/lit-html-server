'use strict';

const { directive } = require('../index.js');

/**
 * Switch between two templates based on a given 'condition'.
 * Not possible to cache and re-use templates in a server context,
 * so this is a simple conditional switch.
 * @param {any} condition
 * @param {() => any} trueValue
 * @param {() => any} falseValue
 * @returns {() => void}
 */
module.exports = function when(condition, trueValue, falseValue) {
  return directive((part) => {
    part.setValue(condition ? trueValue() : falseValue());
  });
};
