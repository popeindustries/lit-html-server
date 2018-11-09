'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Guard against re-render.
   * Not possible to compare against previous render in a server context,
   * so this is a no-op.
   * @param {*} expression
   * @param {function} valueFn
   * @returns {function}
   */
  guard: directive((expression, valueFn) => (part) => {
    part.setValue(valueFn());
  })
};
