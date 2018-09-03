'use strict';

module.exports = {
  isAsyncIterator,
  isDirective,
  isPromise,
  isStream,
  isSyncIterator
};

function isStream(stream) {
  return stream != null && stream.pipe != null;
}

function isPromise(promise) {
  return promise != null && promise.then != null;
}

function isSyncIterator(iterator) {
  return (
    iterator != null &&
    // Ignore strings (which are also iterable)
    typeof iterator !== 'string' &&
    typeof iterator[Symbol.iterator] === 'function'
  );
}

function isAsyncIterator(iterator) {
  return iterator != null && typeof iterator[Symbol.asyncIterator] === 'function';
}

function isDirective(directive) {
  return directive != null && directive.isDirective === true;
}
