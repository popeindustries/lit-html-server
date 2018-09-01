'use strict';

module.exports = {
  isStream,
  isPromise,
  isSyncIterator,
  isAsyncIterator
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
    typeof iterator[Symbol.iterator] === 'function' &&
    iterator.next !== undefined
  );
}

function isAsyncIterator(iterator) {
  return (
    iterator != null &&
    typeof iterator[Symbol.asyncIterator] === 'function' &&
    iterator.next !== undefined
  );
}
