module.exports = {
  /**
   * Define new directive for 'fn'
   * @param {function} fn
   * @returns {function}
   */
  directive(fn) {
    fn.isDirective = true;
    return fn;
  }
};
