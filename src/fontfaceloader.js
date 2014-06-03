goog.provide('fontloader.FontFaceLoader');

goog.require('fontloader.Ruler');
goog.require('fontloader.util');

goog.scope(function () {
  var Ruler = fontloader.Ruler,
      util = fontloader.util;

  /**
   * @constructor
   * @param {fontloader.FontFace} font
   */
  fontloader.FontFaceLoader = function (font) {
    this.font = font;

    /**
     * @type {{sansserif: number, serif: number, monospace: number}}
     */
    this.cache = {
      sansserif: 0,
      serif: 0,
      monospace: 0
    };

    /**
     * @type {string}
     */
    this.text = 'BESbswy';

    var ruler = new Ruler(this.text);

    ruler.insert();

    this.cache.serif = ruler.setStyle(util.extend({}, font.getStyle(), { 'font-family': 'serif' })).getWidth();
    this.cache.sansserif = ruler.setStyle(util.extend({}, font.getStyle(), { 'font-family': 'sans-serif' })).getWidth();
    this.cache.monospace = ruler.setStyle(util.extend({}, font.getStyle(), { 'font-family': 'monospace' })).getWidth();

    ruler.remove();
  };

  var FontFaceLoader = fontloader.FontFaceLoader;

  /**
   * @return {IThenable}
   */
  FontFaceLoader.prototype.load = function () {
    var css = this.font.toCss(),
        text = this.text,
        font = this.font,
        that = this,
        started = goog.now(),
        rulerA = new Ruler(this.text),
        rulerB = new Ruler(this.text);

    return new Promise(function (resolve, reject) {
       function check() {
        var widthA = rulerA.getWidth(),
            widthB = rulerB.getWidth();

        if (that.isFallbackFont(widthA, widthB) || that.isLastResortFont(widthA, widthB)) {
          if (goog.now() - started >= FontFaceLoader.DEFAULT_TIMEOUT) {
            rulerA.remove();
            rulerB.remove();
            reject(new Error('Timeout'));
          } else {
            goog.global.setTimeout(function () {
              check();
             }, 25);
          }
        } else {
          rulerA.remove();
          rulerB.remove();
          resolve(that.font);
        }
      }

      var head = document.head || document.getElementsByTagName('head')[0];

      if (head) {
        var styleElement = document.createElement('style');

        styleElement.setAttribute('type', 'text/css');

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = css;
        } else {
          styleElement.appendChild(document.createTextNode(css));
        }

        head.appendChild(styleElement);

        rulerA.insert();
        rulerA.setStyle(util.extend({}, font.getStyle(), { 'font-family': font.family + ',sans-serif' }));

        rulerB.insert();
        rulerB.setStyle(util.extend({}, font.getStyle(), { 'font-family': font.family + ',serif' }));

        check();
      } else {
        reject(new SyntaxError("Could not find 'head' element in document."));
      }
    });
  };

  /**
   * @type {number}
   */
  FontFaceLoader.DEFAULT_TIMEOUT = 3000;

  /**
   * @type {null|boolean}
   */
  FontFaceLoader.HAS_WEBKIT_FALLBACK_BUG = null;

  /**
   * @private
   * @return {string}
   */
  FontFaceLoader.prototype.getUserAgent = function () {
    return goog.global.navigator.userAgent;
  };

  /**
   * Returns true if this browser is WebKit and it has the fallback bug
   * which is present in WebKit 536.11 and earlier.
   *
   * @return {boolean}
   */
  FontFaceLoader.prototype.hasWebKitFallbackBug = function () {
    if (goog.isNull(FontFaceLoader.HAS_WEBKIT_FALLBACK_BUG)) {
      var match = /AppleWeb[kK]it\/([0-9]+)(?:\.([0-9]+))/.exec(this.getUserAgent());

      FontFaceLoader.HAS_WEBKIT_FALLBACK_BUG = !!match &&
                                            (parseInt(match[1], 10) < 536 ||
                                             (parseInt(match[1], 10) === 536 &&
                                              parseInt(match[2], 10) <= 11));
    }
    return FontFaceLoader.HAS_WEBKIT_FALLBACK_BUG;
  };

  /**
   * @param {number} widthA
   * @param {number} widthB
   * @return {boolean}
   * @private
   */
  FontFaceLoader.prototype.isFallbackFont = function (widthA, widthB) {
    return widthA === this.cache.sansserif &&
           widthB === this.cache.serif;
  };

  /**
   * @param {number} widthA
   * @param {number} widthB
   * @return {boolean}
   * @private
   */
  FontFaceLoader.prototype.isLastResortFont = function (widthA, widthB) {
    return this.hasWebKitFallbackBug() &&
           ((widthA === this.cache.sansserif &&
             widthB === this.cache.sansserif) ||
            (widthA === this.cache.serif &&
             widthB === this.cache.serif) ||
            (widthA === this.cache.monospace &&
             widthB === this.cache.monospace));
  };
});
