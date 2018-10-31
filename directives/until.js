'use strict';

const { directive } = require('../lib/directive.js');

/**
 * Render 'defaultContent'.
 * Not possible to render more than once in a server context,
 * so this is a no-op.
 * @param {Promise<any>} promise
 * @param {any} defaultContent
 * @returns {() => void}
 */
module.exports = function until(promise, defaultContent) {
  return directive((part) => {
    part.setValue(defaultContent);
  });
};
