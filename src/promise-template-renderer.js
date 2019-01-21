import { AttributePart } from './parts.js';
import { isPromise } from './is.js';
import { TemplateResult } from './template-result.js';

/**
 * Render "templateResult" to a string resolving Promise
 * @param { TemplateResult } result
 * @returns {Promise<string>}
 */
export function promiseTemplateRenderer(result) {
  const state = {
    buffer: [],
    html: '',
    pending: []
  };

  render(result, state);

  if (state.pending.length > 0) {
    state.buffer.push(state.html);
    return Promise.all(state.pending).then(() => state.buffer.join(''));
  }

  return Promise.resolve(state.html);
}

function render(result, state) {
  const {
    template: { strings, parts },
    values
  } = result;
  const endIndex = strings.length - 1;

  for (let i = 0; i < endIndex; i++) {
    const string = strings[i];
    const part = parts[i];
    let value = values[i];

    state.html += string;

    if (part instanceof AttributePart) {
      // AttributeParts can have multiple values, so slice based on length
      // (strings in-between values are already stored in the instance)
      if (part.length == 1) {
        value = part.getString([value]);
      } else {
        value = part.getString(values.slice(i, i + part.length));
        i += part.length - 1;
      }
      if (isPromise(value)) {
        // result.push(html, value);
        // html = '';
      } else {
        // html += value;
      }
    } else {
      commit(part.getHTML(value), state);
    }
  }

  state.html += strings[endIndex];
}

function commit(value, state) {
  if (typeof value === 'string') {
    state.html += value;
  } else if (value instanceof TemplateResult) {
    render(value, state);
  } else if (Array.isArray(value)) {
    value.forEach((value) => commit(value, state));
  } else if (isPromise(value)) {
    let index = state.buffer.push(state.html, value) - 1;

    state.html = '';
    state.pending.push(
      value.then((string) => {
        state.buffer[index] = string;
      })
    );
  }
}
