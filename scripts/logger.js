// Lightweight frontend logger for Reviews-Maker
// Usage: append ?debug=1 to URL or set localStorage.RM_DEBUG = '1' to enable verbose logs
(function(){
  try {
    const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams('');
    const envFlag = params.get('debug') === '1' || (typeof localStorage !== 'undefined' && localStorage.getItem('RM_DEBUG') === '1');
    window.__RM_DEBUG = !!envFlag;

    // Preserve originals
    if (!console.__orig) {
      console.__orig = {
        log: console.log.bind(console),
        debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console)
      };
    }

    // When debug is disabled, silence low-level logs but keep warnings/errors
    if (!window.__RM_DEBUG) {
      console.debug = function(){};
      console.log = function(){};
      console.info = function(){};
    } else {
      // When enabled, prefix logs for easier filtering
      const prefix = function(level){ return function(){ try { const args = Array.from(arguments); args.unshift('[RM][DEBUG]'); console.__orig.log.apply(null, args); } catch(e){} }; };
      console.debug = prefix('debug');
      console.log = prefix('log');
      console.info = prefix('info');
    }

    // Expose a simple logger for code to use without touching console directly
    window.RMLogger = {
      debug: (...a) => { if (window.__RM_DEBUG) console.__orig.debug(...a); },
      info: (...a) => { if (window.__RM_DEBUG) console.__orig.info(...a); },
      warn: (...a) => console.__orig.warn(...a),
      error: (...a) => console.__orig.error(...a)
    };
  } catch (e) {
    // final fallback: ensure console exists
  }
})();
