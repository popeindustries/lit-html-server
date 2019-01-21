/**
 *
 */
export class TemplateResult {
  /**
   * Constructor
   * @param {Template} template
   * @param {Array<any>} values
   */
  constructor(template, values) {
    this.template = template;
    this.values = values;
  }

  /**
   * Destroy the instance
   */
  destroy() {
    this.template = undefined;
    this.values = undefined;
  }
}
