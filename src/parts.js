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

export class BooleanAttributePart extends AttributePart {
  constructor(name, strings) {
    super(name, strings);

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw new Error('Boolean attributes can only contain a single expression');
    }
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
