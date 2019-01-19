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

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
export class Template {
  /**
   * Constructor
   * @param {Array<string>} strings
   * @param {DefaultTemplateProcessor} processor
   */
  constructor(strings, processor) {
    this.strings = [];
    this.parts = [];

    this._prepare(strings, processor);
  }

  /**
   * Create strings and parts
   * @param {Array<string>} strings
   * @param {DefaultTemplateProcessor} processor
   */
  _prepare(strings, processor) {
    const endIndex = strings.length - 1;
    let attributeMode = false;
    let nextString = strings[0];

    for (let i = 0; i < endIndex; i++) {
      let string = nextString;
      nextString = strings[i + 1];
      const tagState = getTagState(string);
      let part;

      // Open/close tag found at end of string
      if (tagState !== -1) {
        attributeMode = tagState === 1;
      }

      if (attributeMode) {
        const matchName = lastAttributeNameRegex.exec(string);

        if (matchName) {
          let [, prefix, name, suffix] = matchName;

          // Since attributes are conditional, remove "name" and "suffix" from static string
          string = string.slice(0, matchName.index + prefix.length);

          const matchQuote = RE_QUOTE.exec(suffix);

          // If attribute is quoted, handle potential multiple values
          if (matchQuote) {
            const quoteCharacter = matchQuote[0].charAt(0);
            // Store any text between quote character and value
            const attributeStrings = [suffix.slice(matchQuote.index + 1)];
            let open = true;
            let j = 1;
            let attributeString;

            // Scan ahead and gather all strings for this attribute
            while (open) {
              attributeString = strings[i + j];
              const quoteIndex = attributeString.indexOf(quoteCharacter);

              if (quoteIndex === -1) {
                attributeStrings.push(attributeString);
                j++;
              } else {
                attributeStrings.push(attributeString.slice(0, quoteIndex));
                nextString = attributeString.slice(quoteIndex + 1);
                i += j;
                open = false;
              }
            }

            part = processor.handleAttributeExpressions(name, attributeStrings);
          } else {
            part = processor.handleAttributeExpressions(name, ['', '']);
          }
        }
      } else {
        part = processor.handleTextExpression();
      }

      this.strings.push(string);
      this.parts.push(part);
    }

    this.strings.push(nextString);
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
