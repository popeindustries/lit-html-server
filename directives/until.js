'use strict';

const { directive } = require('../lib/directive.js');

module.exports = {
  /**
   * Render 'defaultContent'.
   * Not possible to render more than once in a server context,
   * so this is a no-op.
   * @param {Promise<*>} promise
   * @param {*} defaultContent
   * @returns {function}
   */
  until: directive((promise, defaultContent) => (part) => {
    part.setValue(defaultContent);
  })
};
