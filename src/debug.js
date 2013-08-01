goog.provide('debug');

goog.scope(function () {
  var cons = goog.global.console;

  /**
   * @param {string} str
   */
  debug.info = function (str) {
    if (goog.DEBUG && cons) {
      cons.log(str);
    }
  };

  /**
   * @param {string} str
   */
  debug.warn = function (str) {
    if (goog.DEBUG && cons) {
      cons.warn(str);
    }
  };

  /**
   * @param {string} str
   */
  debug.error = function (str) {
    if (goog.DEBUG && cons) {
      cons.error(str);
    }
  };
});
