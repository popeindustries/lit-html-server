'use strict';

const { directive } = require('../index.js');

/**
 * Loop through 'items' and call 'template'.
 * No concept of efficient re-ordering possible in server context,
 * so this is a simple no-op map operation.
 * @param {[]} items
 * @param {(any) => any} [keyFn]
 * @param {(any, number) => any} template
 * @returns {() => void}
 */
module.exports = function repeat(items, keyFn, template) {
  if (arguments.length === 2) {
    template = keyFn;
  }

  return directive((part) => {
    part.setValue(items.map((item, index) => template(item, index)));
  });
};
