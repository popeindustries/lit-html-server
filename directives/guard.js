'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Guard against re-render.
   * Not possible to compare against previous render in a server context,
   * so this is a no-op.
   * @param {any} expression
   * @param {() => any} valueFn
   * @returns {() => void}
   */
  guard(expression, valueFn) {
    return directive((part) => {
      part.setValue(valueFn());
    });
  }
};
