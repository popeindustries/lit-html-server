'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Renders one of a series of values, including Promises, in priority order.
   * Not possible to render more than once in a server context,
   * so this is a no-op.
   * @param {...*} args
   * @returns {function}
   */
  until: directive((...args) => (part) => {
    part.setValue(args[0]);
  })
};
