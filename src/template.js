/**
 * @typedef TemplateProcessor { import('./default-template-processor.js').TemplateProcessor }
 */
import { emptyStringBuffer } from './string.js';
import { lastAttributeNameRegex } from 'lit-html/lib/template.js';

const RE_QUOTE = /"[^"]*|'[^']*$/;

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
export class Template {
  /**
   * Create Template instance
   *
   * @param { Array<TemplateStringsArray> } strings
   * @param { TemplateProcessor } processor
   */
  constructor(strings, processor) {
    this.strings = [];
    this.parts = [];

    this._prepare(strings, processor);
  }

  /**
   * Prepare the template's static strings,
   * and create Part instances for the dynamic values,
   * based on lit-html syntax.
   *
   * @param { Array<TemplateStringsArray> } strings
   * @param { TemplateProcessor } processor
   */
  _prepare(strings, processor) {
    const endIndex = strings.length - 1;
    let attributeMode = false;
    let nextString = strings[0];

    for (let i = 0; i < endIndex; i++) {
      let string = nextString;
      nextString = strings[i + 1];
      const tagState = getTagState(string);
      let skip = 0;
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
            const attributeStrings = [Buffer.from(suffix.slice(matchQuote.index + 1))];
            let open = true;
            skip = 0;
            let attributeString;

            // Scan ahead and gather all strings for this attribute
            while (open) {
              attributeString = strings[i + skip + 1];
              const closingQuoteIndex = attributeString.indexOf(quoteCharacter);

              if (closingQuoteIndex === -1) {
                attributeStrings.push(Buffer.from(attributeString));
                skip++;
              } else {
                attributeStrings.push(Buffer.from(attributeString.slice(0, closingQuoteIndex)));
                nextString = attributeString.slice(closingQuoteIndex + 1);
                i += skip;
                open = false;
              }
            }

            part = processor.handleAttributeExpressions(name, attributeStrings);
          } else {
            part = processor.handleAttributeExpressions(name, [
              emptyStringBuffer,
              emptyStringBuffer
            ]);
          }
        }
      } else {
        part = processor.handleTextExpression();
      }

      this.strings.push(Buffer.from(string));
      this.parts.push(part);
      // Add placehholders for strings/parts that wil be skipped due to multple values in a single AttributePart
      if (skip > 0) {
        this.strings.push(null);
        this.parts.push(null);
        skip = 0;
      }
    }

    this.strings.push(Buffer.from(nextString));
  }
}

/**
 * Determine if 'string' terminates with an opened or closed tag.
 *
 * Iterating through all characters has at worst a time complexity of O(n),
 * and is better than the alternative (using "indexOf/lastIndexOf") which is potentially O(2n).
 *
 * @param { string } string
 * @returns { number } - returns "-1" if no tag, "0" if closed tag, or "1" if open tag
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
