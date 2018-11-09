const directives = new WeakMap();

module.exports = {
  /**
   * Determine if 'obj' is a directive function
   * @param {*} obj
   * @returns {boolean}
   */
  isDirective(obj) {
    return typeof obj === 'function' && directives.has(obj);
  },

  /**
   * Define new directive for 'fn'
   * @param {function} fn
   * @returns {function}
   */
  directive(fn) {
    return (...args) => {
      const d = fn(...args);

      directives.set(d, true);
      return d;
    };
  }
};
