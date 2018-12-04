'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Guard against re-render.
   * Not possible to compare against previous render in a server context,
   * so this is a no-op.
   * @param {*} value
   * @param {function} fn
   * @returns {function}
   */
  guard: directive((value, fn) => (part) => {
    part.setValue(fn());
  })
};
