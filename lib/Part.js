'use strict';

module.exports = class Part {
  constructor(isAttribute) {
    this.isAttribute = isAttribute;
    this._value;
  }

  setValue(value) {
    this._value = value;
  }

  commit() {
    // no-op
  }
};
