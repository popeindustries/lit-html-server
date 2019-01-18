/**
 * html`text`
 * html`${'text'}`
 * html`${123}`
 * html`${undefined}`
 * html`${null}`
 * html`${value}`
 * html`${[1,2,3]}`
 * html`${html`text`} text`
 * html`${'text'} ${'text'}`
 * html`${[1,2,3].map((i) => html`${i}`)}`
 *
 * html`<el a="${'text'}">`
 * html`<el a="t${'e'}x${'t'}s">`
 * html`<el a="${value} b="${value}">`
 * html`<el style="prop: ${value}">`
 * html`<el style="${prop}: ${value}">`
 * html`<el a=${'text'}>`
 * html`<el a="b=${'value'}">`
 * html`<el a=${[1,2,3]}>`
 * html`<el a=${undefined}>`
 * html`<el .p=${123}>`
 * html`<el ?b="${value}">`
 * html`<el @e=${value}>`
 *
 * html`${directive()}`
 * html`<el a="${directive()}">`
 * html`<el .p="${directive()}">`
 */

import { lastAttributeNameRegex } from 'lit-html/lib/template.js';

const RE_QUOTE = /"[^"]*|'[^']*$/;

export class TemplateResult {
  /**
   * Create TemplateResult instance from call to "html`...`"
   * @param {Array<string>} strings
   * @param {Array<*>} values
   * @param {string} type
   * @param {DefaultTemplateProcessor} processor
   */
  constructor(strings, values, type, processor) {
    this.type = type;
    this.processor = processor;
    this.content = [];

    this._prepare(strings, values);
  }

  setValues() {}

  getHTML() {}

  _prepare(strings, values) {
    const endIndex = strings.length - 1;
    let attributeMode = false;
    let nextString = strings[0];
    let currentString, currentValue;

    for (let i = 0; i < endIndex; i++) {
      currentString = nextString;
      currentValue = values[i];
      nextString = strings[i + 1];
      const tagState = getTagState(currentString);

      // Open/close tag found at end of string
      if (tagState !== -1) {
        attributeMode = tagState === 1;
      }

      if (attributeMode) {
        const matchName = lastAttributeNameRegex.exec(currentString);

        if (matchName) {
          let [, prefix, name, suffix] = matchName;

          // Since attributes are conditional, remove everything after "prefix" from static string
          currentString = currentString.slice(0, matchName.index + prefix.length);

          const matchQuote = RE_QUOTE.exec(suffix);

          // If attribute is quoted, handle potential multiple values
          if (matchQuote) {
            const quoteCharacter = matchQuote[0].charAt(0);
            // Store any text between quote character and value
            const attributeStrings = [suffix.slice(matchQuote.index + 1)];
            const attributeValues = [currentValue];
            let open = true;
            let j = 1;
            let attributeString, attributeValue;

            // Scan ahead and gather all strings/values for this attribute
            while (open) {
              attributeString = strings[i + j];
              attributeValue = values[i + j];
              const quoteIndex = attributeString.indexOf(quoteCharacter);

              if (quoteIndex === -1) {
                attributeStrings.push(attributeString);
                attributeValues.push(attributeValue);
                j++;
              } else {
                attributeStrings.push(attributeString.slice(0, quoteIndex));
                nextString = attributeString.slice(quoteIndex + 1);
                i += j;
                open = false;
              }
            }

            currentValue = this.processor.handleAttributeExpressions(name, attributeStrings);
            // Set values here to avoid iteration cost of TemplateResult#setValues
            currentValue.setValue(attributeValues);
          } else {
            currentValue = this.processor.handleAttributeExpressions(name, ['', '']);
            // Set values here to avoid iteration cost of TemplateResult#setValues
            currentValue.setValue([currentValue]);
          }
        }
      } else {
        currentValue = this.processor.handleTextExpression(currentValue);
      }

      this.content.push(currentString, currentValue);
    }

    this.content.push(nextString);
  }
}

/**
 * Determine if 'string' terminates with an opened or closed tag.
 *
 * Iterating through all characters has at worst a time complexity of O(n),
 * and is better than the alternative (using "indexOf/lastIndexOf") which is potentially O(2n).
 * @param {string} string
 * @returns {number} returns "-1" if no tag, "0" if closed tag, or "1" if open tag
 */
function getTagState(string) {
  for (let i = string.length - 1; i >= 0; i--) {
    const char = string[i];

    if (char === '>') {
      return 0;
    } else if (char === '<') {
      return 1;
    }
  }

  return -1;
}
