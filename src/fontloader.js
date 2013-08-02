goog.provide('fontloader');

goog.require('fontloader.CSSValue');
goog.require('fontloader.FontWatcher');
goog.require('fontloader.util');

goog.scope(function () {
  var CSSValue = fontloader.CSSValue,
      FontWatcher = fontloader.FontWatcher,
      util = fontloader.util;

  /**
   * @type {!fontloader.EventHandler}
   */
  fontloader.onloading = goog.nullFunction;

  /**
   * @type {!fontloader.EventHandler}
   */
  fontloader.onloadingdone = goog.nullFunction;

  /**
   * @type {!fontloader.EventHandler}
   */
  fontloader.onloadstart = goog.nullFunction;

  /**
   * @type {!fontloader.EventHandler}
   */
  fontloader.onload = goog.nullFunction;

  /**
   * @type {!fontloader.EventHandler}
   */
  fontloader.onerror = goog.nullFunction;

  /**
   * Check and start load if appropriate
   * and fire callback when all loads complete
   *
   * @param {!fontloader.LoadFontParameters} params
   */
  fontloader.loadFont = function (params) {
    /**
     * @type {fontloader.CSSValue}
     */
    var font = CSSValue.parse(params['font']);

    /**
     * @type {Array.<string>}
     */
    var fontFamilies = /** @type {Array.<string>} */ (font['font-family']);

    /**
     * @type {!fontloader.FontsReadyCallback}
     */
    var successCallback = params['success'] || goog.nullFunction;

    /**
     * @type {!fontloader.FontsReadyCallback}
     */
    var errorCallback = params['error'] || goog.nullFunction;

    /**
     * @type {?string}
     */
    var text = params['text'];

    /**
     * @type {fontloader.FontWatcher}
     */
    var fontWatcher = new FontWatcher(font, text);

    var loaded = [],
        errors = [];

    fontloader.loading = true;

    util.forEach(fontFamilies, function (family, callback) {
      family = /** @type {string} */ (family);

      if (family.length > 31) {
        debug.warn('Font "' + family + '" is longer than 31 characters and will most likely not work in Internet Explorer.');
      }

      if (family === font['font-family'][0]) {
        fontloader.onloading({
          fontface: family,
          error: null
        });
      }

      fontloader.onloadstart({
        fontface: family,
        error: null
      });

      fontWatcher.start(util.extend({}, font, { 'font-family': family }), function (err) {
        if (err) {
          errors.push(family);
          fontloader.onerror({
            fontface: family,
            error: new Error('Timeout')
          });
        } else {
          loaded.push(family);
          fontloader.onload({
            fontface: family,
            error: null
          });
        }
        callback(null);
      });
    }, function () {
      fontloader.loading = false;

      fontloader.onloadingdone({
        fontface: font['font-family'][font['font-family'].length - 1],
        error: null
      });

      if (errors.length) {
        errorCallback();
      } else {
        successCallback();
      }
    });
  };

  /**
   * Return whether all fonts in the fontlist are loaded
   * (does not initiate load if not available)
   *
   * @param {string} font
   * @param {string=} opt_text
   * @return {boolean}
   */
  fontloader.checkFont = function (font, opt_text) {
    // This would be easy to implement if it were not
    // for the guarantee that it does not initiate loading
    // if the font is not available, the synchronous API,
    // and the WebKit fallback bug.
    throw new Error('NotImplemented');
  };

  /**
   * Async notify upon completion, pending layout changes
   *
   * @param {fontloader.FontsReadyCallback} fontsReadyCallback
   */
  fontloader.notifyWhenFontsReady = function (fontsReadyCallback) {
    throw new Error('NotImplemented');
  };

  /**
   * Loading state, true while one or more fonts loading, false otherwise
   *
   * @type {boolean}
   */
  fontloader.loading = false;
});

if (goog.DEBUG || !goog.global.document['fontloader']) {
  goog.global.document['fontloader'] = {
    'onloading': fontloader.onloading,
    'onloadingdone': fontloader.onloadingdone,
    'onloadstart': fontloader.onloadstart,
    'onload': fontloader.onload,
    'onerror': fontloader.onerror,
    'loadFont': fontloader.loadFont,
    'checkFont': fontloader.checkFont,
    'notifyWhenFontsReady': fontloader.notifyWhenFontsReady,
    'loading': fontloader.loading
  };
}
