// https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-rules-summary
// https://github.com/mathiasbynens/jsesc/blob/master/jsesc.js
// https://mathiasbynens.be/notes/json-dom-csp

const HTML_ESCAPES = {
  '"': '&quot;',
  "'": '&#x27;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};
const JSON_ESCAPES = {
  '"': '\u0022',
  "'": '\u0027',
  '&': '\u0026'
};
const RE_HTML = /["'&<>]/g;
const RE_JSON = /["'&]/g;
const RE_SCRIPT_STYLE_TAG = /<\/(script|style)/gi;

/**
 * Safely escape "string" for inlining
 *
 * @param { string } string
 * @param { string } context - one of text|attribute|script|style
 * @returns { string }
 */
export function escape(string, context = 'text') {
  switch (context) {
    case 'script':
    case 'style':
      return string.replace(RE_SCRIPT_STYLE_TAG, '<\\/$1').replace(/<!--/g, '\\x3C!--');
    case 'attribute:json':
      return string.replace(RE_JSON, (match) => JSON_ESCAPES[match]);
    case 'attribute':
    case 'text':
    default:
      return string.replace(RE_HTML, (match) => HTML_ESCAPES[match]);
  }
}
