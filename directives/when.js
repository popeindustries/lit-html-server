'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Switch between two templates based on a given 'condition'.
   * Not possible to cache and re-use templates in a server context,
   * so this is a simple conditional switch.
   * @param {*} condition
   * @param {function} trueValue
   * @param {function} falseValue
   * @returns {function}
   */
  when: directive((condition, trueValue, falseValue) => (part) => {
    part.setValue(condition ? trueValue() : falseValue());
  })
};
