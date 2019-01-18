import { DefaultTemplateProcessor } from './default-template-processor.js';
import { TemplateResult } from './template-result.js';

export { defaultTemplateProcessor, html, templateCache };

const defaultTemplateProcessor = new DefaultTemplateProcessor();
const templateCache = new Map();

function html(strings, ...values) {
  let template = templateCache.get(strings);

  if (template === undefined) {
    template = new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
    templateCache.set(strings, template);
  } else {
    template.setValues(values);
  }

  return template;
}
