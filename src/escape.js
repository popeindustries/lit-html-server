// https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-rules-summary
// https://github.com/mathiasbynens/jsesc/blob/master/jsesc.js

/** @type { { [name: string]: string } } */
const HTML_ESCAPES = {
  '"': '&quot;',
  "'": '&#x27;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};
const RE_HTML = /["'&<>]/g;
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
    case 'attribute':
    case 'text':
    default:
      return string.replace(RE_HTML, (match) => HTML_ESCAPES[match]);
  }
}
