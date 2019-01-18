export class Part {
  constructor(value) {
    this.value = value;
  }

  setValue(value) {
    this.value = value;
  }

  commit() {}
}

export class NodePart extends Part {
  constructor(value) {
    super(value);
  }

  commit() {
    // TODO: handle value types
    return this.value;
  }
}

export class AttributePart extends Part {
  constructor(value, name, strings) {
    super(value);
    this.name = name;
    this.strings = strings;
  }

  commit() {
    // TODO: handle strings and value types
    return this.value;
  }
}

export class BooleanAttributePart extends Part {
  constructor(value, name, strings) {
    super(value);
    this.name = name;
    this.strings = strings;
  }

  commit() {
    // TODO: handle strings and value types
    return this.value;
  }
}

export class PropertyAttributePart extends Part {
  commit() {
    return '';
  }
}

export class EventAttributePart extends Part {
  commit() {
    return '';
  }
}
