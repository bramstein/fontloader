goog.provide('fontloader.util');

goog.scope(function () {
  var util = fontloader.util;

  /**
   * @param {...Object.<string, string>} var_args
   * @return {Object.<string, string>}
   */
  util.extend = function (var_args) {
    for (var i = 1; i < arguments.length; i += 1) {
      for (var p in arguments[i]) {
        if (arguments[i].hasOwnProperty(p)) {
          arguments[0][p] = arguments[i][p];
        }
      }
    }
    return arguments[0];
  };

  /**
   * @param {*} v
   * @return {boolean}
   */
  util.nonNativeIsArray = function (v) {
    return Object.prototype.toString.call(v) === '[object Array]';
  };

  /**
   * @param {*} v
   * @return {boolean}
   */
  util.isArray = goog.isDef(Array.isArray) ? Array.isArray : util.nonNativeIsArray;
});
