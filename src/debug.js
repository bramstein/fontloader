goog.provide('debug');

goog.scope(function () {
  var cons = goog.global.console;

  /**
   * @param {!{length}} o
   * @return {!Array}
   */
  debug.toArray = function (o) {
    return Array.prototype.slice.call(o, 0);
  };

  /**
   * @const
   * @private
   * @type {number}
   */
  debug.startup = goog.now();

  /**
   * @private
   * @return {string}
   */
  debug.timestamp = function () {
    return ((goog.now() - debug.startup) / 1000).toFixed(3);
  };

  /**
   * @param {...*} var_args
   */
  debug.info = function (var_args) {
    if (goog.DEBUG && cons) {
      var args = debug.toArray(arguments);

      if (goog.isString(args[0])) {
        cons.log.apply(cons, ['[%ss] ' + args[0], debug.timestamp()].concat(args.slice(1)));
      } else {
        cons.log.apply(cons, ['[%ss]', debug.timestamp()].concat(args));
      }
    }
  };

  /**
   * @param {...*} var_args
   */
  debug.warn = function (var_args) {
    if (goog.DEBUG && cons) {
      var args = debug.toArray(arguments);

      if (goog.isString(args[0])) {
        cons.warn.apply(cons, ['[%ss] ' + args[0], debug.timestamp()].concat(args.slice(1)));
      } else {
        cons.warn.apply(cons, ['[%ss]', debug.timestamp()].concat(args));
      }
    }
  };

  /**
   * @param {...*} var_args
   */
  debug.error = function (var_args) {
    if (goog.DEBUG && cons) {
      var args = debug.toArray(arguments);

      if (goog.isString(args[0])) {
        cons.error.apply(cons, ['[%ss] ' + args[0], debug.timestamp()].concat(args.slice(1)));
      } else {
        cons.error.apply(cons, ['[%ss]', debug.timestamp()].concat(args));
      }
    }
  };
});
