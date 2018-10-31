'use strict';

const { directive } = require('../lib/directive.js');

/**
 * Apply CSS classes.
 * Only applies to 'class' attribute.
 * 'classInfo' keys are added as class names if values are truthy
 * @param {object} classInfo
 * @returns {() => void}
 */
module.exports = function classMap(classInfo) {
  return directive((part) => {
    if (!part.isAttribute || part.attributeName !== 'class') {
      throw Error('The `classMap` directive must be used in the `class` attribute');
    }

    let value = '';

    for (const key in classInfo) {
      if (classInfo[key]) {
        value += `${value.length ? ' ' : ''}${key}`;
      }
    }

    part.setValue(value);
  });
};
