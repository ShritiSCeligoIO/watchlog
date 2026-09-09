const jsdom = require('jest-environment-jsdom');

const JsdomEnvironment = jsdom.TestEnvironment ?? jsdom.default;
const WEB_GLOBALS = [
  'fetch', 'Request', 'Response', 'Headers', 'FormData', 'Blob', 'File',
  'ReadableStream', 'WritableStream', 'TransformStream', 'TextEncoder',
  'TextDecoder', 'structuredClone', 'BroadcastChannel', 'AbortController',
  'AbortSignal',
];

class JsdomWithFetch extends JsdomEnvironment {
  constructor(config, context) {
    super(config, context);
    for (const name of WEB_GLOBALS) {
      if (globalThis[name] !== undefined) {
        Object.defineProperty(this.global, name, {
          value: globalThis[name],
          writable: true,
          configurable: true,
        });
      }
    }

    const originalMatches = this.global.Element.prototype.matches;
    this.global.Element.prototype.matches = function matches(selector) {
      return /:(?:fullscreen|modal)\b/.test(selector)
        ? false
        : originalMatches.call(this, selector);
    };
  }
}

module.exports = JsdomWithFetch;
