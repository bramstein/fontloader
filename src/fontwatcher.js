goog.provide('fontloader.FontWatcher');

goog.require('fontloader.Ruler');
goog.require('fontloader.util');
goog.require('debug');

goog.scope(function () {
  var Ruler = fontloader.Ruler,
      util = fontloader.util;

  /**
   * @param {fontloader.CSSValue} style
   * @param {?string=} opt_text
   * @constructor
   */
  fontloader.FontWatcher = function (style, opt_text) {
    /**
     * @type {{sansserif: number, serif: number, monospace: number}}
     */
    this.fontCache = {
      sansserif: 0,
      serif: 0,
      monospace: 0
    };

    /**
     * @const
     * @type {string}
     */
    this.text = opt_text || FontWatcher.DEFAULT_TEST_STRING;

    var ruler = new Ruler(this.text);

    ruler.insert();

    this.fontCache.serif = ruler.setStyle(util.extend({}, style, { 'font-family': 'serif' })).getWidth();
    this.fontCache.sansserif = ruler.setStyle(util.extend({}, style, { 'font-family': 'sans-serif' })).getWidth();
    this.fontCache.monospace = ruler.setStyle(util.extend({}, style, { 'font-family': 'monospace' })).getWidth();

    ruler.remove();

    debug.info('Finished setting up fall back font cache:');
    debug.info('  serif: ' + this.fontCache.serif);
    debug.info('  sans-serif: ' + this.fontCache.sansserif);
    debug.info('  monospace: ' + this.fontCache.monospace);
  };

  var FontWatcher = fontloader.FontWatcher;

  /**
   * @type {string}
   */
  FontWatcher.DEFAULT_TEST_STRING = 'BESbswy';

  /**
   * @type {number}
   */
  FontWatcher.DEFAULT_TIMEOUT = 5000;

  /**
   * @type {null|boolean}
   */
  FontWatcher.HAS_WEBKIT_FALLBACK_BUG = null;

  /**
   * @private
   * @return {string}
   */
  FontWatcher.prototype.getUserAgent = function () {
    return goog.global.navigator.userAgent;
  };

  /**
   * Returns true if this browser is WebKit and it has the fallback bug
   * which is present in WebKit 536.11 and earlier.
   *
   * @return {boolean}
   */
  FontWatcher.prototype.hasWebKitFallbackBug = function () {
    if (goog.isNull(FontWatcher.HAS_WEBKIT_FALLBACK_BUG)) {
      var match = /AppleWeb[kK]it\/([0-9]+)(?:\.([0-9]+))/.exec(this.getUserAgent());

      FontWatcher.HAS_WEBKIT_FALLBACK_BUG = !!match &&
                                            (parseInt(match[1], 10) < 536 ||
                                             (parseInt(match[1], 10) === 536 &&
                                              parseInt(match[2], 10) <= 11));
    }
    return FontWatcher.HAS_WEBKIT_FALLBACK_BUG;
  };

  /**
   * @param {fontloader.CSSValue} font
   * @param {function(Error, fontloader.CSSValue)} callback
   */
  FontWatcher.prototype.start = function (font, callback) {
    var rulerA = new Ruler(this.text),
        rulerB = new Ruler(this.text),
        that = this;

    debug.info('Starting font watching for "' + font['font-family'] + '" font');
    debug.info('WebKit fallback bug ' + this.hasWebKitFallbackBug());

    rulerA.insert();
    rulerA.setStyle(util.extend({}, font, { 'font-family': font['font-family'] + ',sans-serif' }));

    rulerB.insert();
    rulerB.setStyle(util.extend({}, font, { 'font-family': font['font-family'] + ',serif' }));

    var started = goog.now();

    function check(done) {
      var widthA = rulerA.getWidth(),
          widthB = rulerB.getWidth();

      if (that.isFallbackFont(widthA, widthB) || that.isLastResortFont(widthA, widthB)) {
        if (goog.now() - started >= FontWatcher.DEFAULT_TIMEOUT) {
          debug.info('Timeout while loading "' + font['font-family'] + '"');
          done(new Error('Timeout'), font);
        } else {
          goog.global.setTimeout(function () {
            check(done);
          }, 25);
        }
      } else {
        debug.info('"' + font['font-family'] + '" loaded succesfully');
        done(null, font);
      }
    }

    check(function (err, font) {
      rulerA.remove();
      rulerB.remove();
      callback(err, font);
    });
  };

  /**
   * @param {number} widthA
   * @param {number} widthB
   * @return {boolean}
   * @private
   */
  FontWatcher.prototype.isFallbackFont = function (widthA, widthB) {
    return widthA === this.fontCache.sansserif &&
           widthB === this.fontCache.serif;
  };

  /**
   * @param {number} widthA
   * @param {number} widthB
   * @return {boolean}
   * @private
   */
  FontWatcher.prototype.isLastResortFont = function (widthA, widthB) {
    return this.hasWebKitFallbackBug() &&
           ((widthA === this.fontCache.sansserif &&
             widthB === this.fontCache.sansserif) ||
            (widthA === this.fontCache.serif &&
             widthB === this.fontCache.serif) ||
            (widthA === this.fontCache.monospace &&
             widthB === this.fontCache.monospace));
  };
});
