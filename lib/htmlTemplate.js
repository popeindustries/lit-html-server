const streamTemplate = require('stream-template');

const PLACEHOLDER = '{async interpolation}';
const RE_OPEN_TAG = /<[^/>]*?$/;
const RE_CLOSED_TAG = /^[^>]*?>/;
// https://github.com/Polymer/lit-html/blob/be84d43f446f22fdd4d44201155b60cf35318912/src/lib/template.ts#L244
// eslint-disable-next-line no-control-regex
const RE_ATTRIBUTE_NAME = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;

/**
 * Async tagged template processor for HTML templates.
 * Returns string for simple interpolation types,
 * or a ReadableStream if complex (ReadableStream, Promise, Array, Buffer).
 * @param {[string]} strings
 * @param {...string|number|boolean|Array|Promise|ReadableStream} interpolations
 * @returns {string|ReadableStream}
 */
module.exports = function htmlTemplate(strings, ...interpolations) {
  let templateString = strings[0];
  let isAttributeMode = false;
  let stripQuote = false;
  let asyncInterpolations;

  for (let i = 0, n = interpolations.length; i < n; i++) {
    const string = strings[i + 1];
    let interpolation = interpolations[i];
    const type = typeof interpolation;
    const isPrimitive =
      type === 'string' || type === 'number' || type === 'boolean' || type === 'function';

    // If already in open tag, check for closing
    if (isAttributeMode) {
      isAttributeMode = !RE_CLOSED_TAG.test(templateString);
    }
    // If not in open tag, check for opening (handles case where string closes then opens)
    if (!isAttributeMode) {
      isAttributeMode = RE_OPEN_TAG.test(templateString);
    }

    if (!isPrimitive) {
      if (isAttributeMode) {
        throw Error(
          `only primitive values are valid when interpolating element attributes: ${templateString.slice(
            Math.min(templateString.length, 10) * -1
          )}\${[${type}]}${string.slice(0, Math.min(string.length, 10))}`
        );
      }
      asyncInterpolations = asyncInterpolations || [];
      asyncInterpolations.push(interpolation);
      interpolation = PLACEHOLDER;
    } else if (isAttributeMode) {
      const attributeNameMatch = RE_ATTRIBUTE_NAME.exec(templateString);

      if (attributeNameMatch !== null && attributeNameMatch[1] !== undefined) {
        const attributeName = attributeNameMatch[1];
        const specialAttributeFlag = attributeName.charAt(0);
        const lastChar = templateString.charAt(templateString.length - 1);
        const hasOpenQuote = lastChar === "'" || lastChar === '"';

        // Handle lit-html argument prefixes
        if (
          specialAttributeFlag === '?' ||
          specialAttributeFlag === '.' ||
          specialAttributeFlag === '@'
        ) {
          stripQuote = hasOpenQuote;
          templateString = templateString.slice(0, attributeNameMatch.index + 1);
          if (specialAttributeFlag === '?' && interpolation) {
            templateString += attributeName.slice(1);
          }
          interpolation = '';
        } else if (!hasOpenQuote) {
          // Add missing quotes
          interpolation = `"${interpolation}"`;
        }
      }
    }

    templateString += interpolation;
    templateString += stripQuote ? string.slice(1) : string;
    stripQuote = false;
  }

  // Return stream if async interpolations
  if (asyncInterpolations && asyncInterpolations.length > 0) {
    return streamTemplate(templateString.split(PLACEHOLDER), ...asyncInterpolations);
  }

  return templateString;
};
