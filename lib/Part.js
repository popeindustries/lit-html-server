export default class Part {
  constructor(isAttribute, attributeName) {
    this.isAttribute = isAttribute;
    this.attributeName = attributeName;
    this._value;
  }

  setValue(value) {
    this._value = value;
  }

  commit() {
    // no-op
  }
}
