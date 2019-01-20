import { emptyArray, removeHeader, sanitize } from './string.js';
import { isPromise, isSyncIterator } from './is.js';

/**
 * Asynchronous tagged template processor for HTML templates created with `htmlTemplate`.
 * Returns a Promise.
 * @param {[string]} strings
 * @param {any} values
 * @returns {Promise<string>}
 */
export default function asyncHtmlTemplate(strings, ...values) {
  return new Promise((resolve, reject) => {
    const stringBuffer = [strings[0]];
    let outstanding = 0;
    let destroyed = false;

    for (let i = 0, n = values.length; i < n; i++) {
      let value = values[i];
      const type = typeof value;

      // Treat Array/iterator as nested template in order to correctly handle all types
      if (Array.isArray(value) || isSyncIterator(value)) {
        value = Array.from(value);
        value = asyncHtmlTemplate(emptyArray(value.length + 1), ...value);
      }

      // TODO: add iterator support
      // TODO: add directive support?
      // Handle primitives
      if (value == null || type === 'string' || type === 'number' || type === 'boolean') {
        // Ignore undefined
        // Stringify and remove any headers added by htmlTemplate parent and/or template nesting
        value = value === undefined ? '' : `${removeHeader(value)}`;
      } else if (isPromise(value)) {
        outstanding++;
        value
          .then((result) => {
            // Escape before adding to buffer
            stringBuffer[i + i + 1] = sanitize(result);
            if (!--outstanding) {
              resolve(stringBuffer.join(''));
            }
          })
          .catch((err) => {
            if (!destroyed) {
              destroyed = true;
              reject(err);
            }
          });
      } else {
        destroyed = true;
        return reject(Error(`uknown interpolation value: ${value}`));
      }

      stringBuffer.push(value, strings[i + 1]);
    }

    if (!outstanding) {
      resolve(stringBuffer.join(''));
    }
  });
}
