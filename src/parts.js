export class Part {
  constructor() {
    this.length = 1;
    this.value;
  }

  setValue(value) {
    this.value = value;
  }

  commit() {}
}

export class NodePart extends Part {
  setValue(/* value */) {}
}

export class AttributePart extends Part {
  constructor(name, strings) {
    super();
    this.name = name;
    this.strings = strings;
    this.length = strings.length - 1;
  }

  setValue(/* value */) {}
}

export class BooleanAttributePart extends AttributePart {
  constructor(name, strings) {
    super(name, strings);

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw new Error('Boolean attributes can only contain a single expression');
    }
  }

  setValue(/* value */) {}
}

export class PropertyAttributePart extends Part {
  setValue(/* value */) {
    this.value = '';
  }
}

export class EventAttributePart extends Part {
  setValue(/* value */) {
    this.value = '';
  }
}
