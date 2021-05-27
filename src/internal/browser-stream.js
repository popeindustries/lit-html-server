/**
 * A minimal Readable stream class to prevent browser parse errors resulting from
 * the static importing of Node-only code.
 * This module should be provided as an alias for Node's built-in 'stream' module
 * when run in the browser.
 * @see package.json#browser
 */
export class Readable {}
