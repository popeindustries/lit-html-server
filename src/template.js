/**
 * @typedef TemplateProcessor { import('./default-template-processor.js').TemplateProcessor }
 */
import { emptyStringBuffer } from './string.js';
import { lastAttributeNameRegex } from 'lit-html/lib/template.js';

const RE_QUOTE = /"[^"]*|'[^']*$/;
/* eslint no-control-regex: 0 */
const RE_TAG_NAME_END = /[ <>/\x09\x0a\x0c\x0d]/;
const TAG_OPEN = 1;
const TAG_CLOSED = 0;
const TAG_NONE = -1;

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
    let tagName = '';

    for (let i = 0; i < endIndex; i++) {
      let string = nextString;
      nextString = strings[i + 1];
      const [tagState, tagStateIndex] = getTagState(string);
      let skip = 0;
      let part;

      // Open/close tag found at end of string
      if (tagState !== TAG_NONE) {
        attributeMode = tagState !== TAG_CLOSED;
        tagName = getTagName(string, tagState, tagStateIndex);
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

            part = processor.handleAttributeExpressions(name, attributeStrings, tagName);
          } else {
            part = processor.handleAttributeExpressions(
              name,
              [emptyStringBuffer, emptyStringBuffer],
              tagName
            );
          }
        }
      } else {
        part = processor.handleTextExpression(tagName);
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
 * @returns { Array<number> } - returns tuple "[-1, -1]" if no tag, "[0, i]" if closed tag, or "[1, i]" if open tag
 */
function getTagState(string) {
  for (let i = string.length - 1; i >= 0; i--) {
    const char = string[i];

    if (char === '>') {
      return [TAG_CLOSED, i];
    } else if (char === '<') {
      return [TAG_OPEN, i];
    }
  }

  return [TAG_NONE, -1];
}

/**
 * Retrieve tag name from "string" starting at "tagStateIndex" position
 * Walks forward or backward based on "tagState" open or closed
 *
 * @param { string } string
 * @param { number } tagState
 * @param { number } tagStateIndex
 */
function getTagName(string, tagState, tagStateIndex) {
  let tagName = '';

  if (tagState === TAG_OPEN) {
    for (let i = tagStateIndex + 1; i < string.length; i++) {
      const char = string[i];

      if (RE_TAG_NAME_END.test(char)) {
        break;
      }

      tagName += char;
    }
  } else {
    for (let i = tagStateIndex - 1; i >= 0; i--) {
      const char = string[i];

      if (RE_TAG_NAME_END.test(char)) {
        break;
      }

      tagName = char + tagName;
    }
  }

  return tagName;
}
