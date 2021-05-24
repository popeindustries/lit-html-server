import { AttributePart, BooleanAttributePart, ChildPart, EventAttributePart, PropertyAttributePart } from './parts.js';
import { Buffer } from 'buffer';

const EMPTY_STRING_BUFFER = Buffer.from('');
const RE_QUOTE = /"[^"]*|'[^']*$/;
/* eslint no-control-regex: 0 */
const RE_TAG_NAME = /[a-zA-Z0-9._-]/;
const TAG_OPEN = 1;
const TAG_CLOSED = 0;
const TAG_NONE = -1;

const lastAttributeNameRegex =
  /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
export class Template {
  /**
   * Create Template instance
   *
   * @param { TemplateStringsArray } strings
   */
  constructor(strings) {
    /** @type { Array<Buffer | null> } */
    this.strings = [];
    /** @type { Array<Part | null> } */
    this.parts = [];

    this._prepare(strings);
  }

  /**
   * Prepare the template's static strings,
   * and create Part instances for the dynamic values,
   * based on lit-html syntax.
   *
   * @param { TemplateStringsArray } strings
   */
  _prepare(strings) {
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
        // Find tag name if open, or if closed and no existing tag name
        if (tagState === TAG_OPEN || tagName === '') {
          tagName = getTagName(string, tagState, tagStateIndex);
        }
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

            part = handleAttributeExpressions(name, attributeStrings, tagName);
          } else {
            part = handleAttributeExpressions(name, [EMPTY_STRING_BUFFER, EMPTY_STRING_BUFFER], tagName);
          }
        }
      } else {
        part = handleTextExpression(tagName);
      }

      this.strings.push(Buffer.from(string));
      // @ts-ignore: part will never be undefined here
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
 * @returns { string }
 */
function getTagName(string, tagState, tagStateIndex) {
  let tagName = '';

  if (tagState === TAG_CLOSED) {
    // Walk backwards until open tag
    for (let i = tagStateIndex - 1; i >= 0; i--) {
      const char = string[i];

      if (char === '<') {
        return getTagName(string, TAG_OPEN, i);
      }
    }
  } else {
    for (let i = tagStateIndex + 1; i < string.length; i++) {
      const char = string[i];

      if (!RE_TAG_NAME.test(char)) {
        break;
      }

      tagName += char;
    }
  }

  return tagName;
}

/**
 * Create part instance for dynamic attribute values
 *
 * @param { string } name
 * @param { Array<Buffer> } strings
 * @param { string } tagName
 * @returns { AttributePart }
 */
function handleAttributeExpressions(name, strings = [], tagName) {
  const prefix = name[0];

  if (prefix === '.') {
    return new PropertyAttributePart(name.slice(1), strings, tagName);
  } else if (prefix === '@') {
    return new EventAttributePart(name.slice(1), strings, tagName);
  } else if (prefix === '?') {
    return new BooleanAttributePart(name.slice(1), strings, tagName);
  }

  return new AttributePart(name, strings, tagName);
}

/**
 * Create part instance for dynamic text values
 *
 * @param { string } tagName
 * @returns { ChildPart }
 */
function handleTextExpression(tagName) {
  return new ChildPart(tagName);
}
