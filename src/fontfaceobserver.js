goog.provide('fontloader.FontFaceObserver');

goog.require('fontloader.Ruler');
goog.require('fontloader.util');

goog.scope(function () {
  var Ruler = fontloader.Ruler,
      util = fontloader.util;

  /**
   * @constructor
   * @param {fontloader.FontFace} font
   */
  fontloader.FontFaceObserver = function (font) {
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
    this.text = font['testString'];

    var ruler = new Ruler(this.text);

    ruler.insert();

    this.cache.serif = ruler.setStyle(util.extend({}, font.getStyle(), { 'font-family': 'serif' })).getWidth();
    this.cache.sansserif = ruler.setStyle(util.extend({}, font.getStyle(), { 'font-family': 'sans-serif' })).getWidth();
    this.cache.monospace = ruler.setStyle(util.extend({}, font.getStyle(), { 'font-family': 'monospace' })).getWidth();

    ruler.remove();
  };

  var FontFaceObserver = fontloader.FontFaceObserver;

  /**
   * @return {IThenable}
   */
  FontFaceObserver.prototype.start = function () {
    var css = this.font.toCss(),
        font = this.font,
        that = this,
        started = goog.now(),
        rulerA = new Ruler(this.text),
        rulerB = new Ruler(this.text),
        referenceElement = document.getElementsByTagName('script')[0],
        styleElement = document.createElement('style');

    return new Promise(function (resolve, reject) {
       function check() {
        var widthA = rulerA.getWidth(),
            widthB = rulerB.getWidth();

        if (that.isFallbackFont(widthA, widthB) || that.isLastResortFont(widthA, widthB)) {
          if (goog.now() - started >= FontFaceObserver.DEFAULT_TIMEOUT) {
            rulerA.remove();
            rulerB.remove();
            referenceElement.parentNode.removeChild(styleElement);
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

      styleElement.setAttribute('type', 'text/css');

      if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = css;
      } else {
        styleElement.appendChild(document.createTextNode(css));
      }

      referenceElement.parentNode.insertBefore(styleElement, referenceElement);
      //head.appendChild(styleElement);

      rulerA.insert();
      rulerA.setStyle(util.extend({}, font.getStyle(), { 'font-family': font.family + ',sans-serif' }));

      rulerB.insert();
      rulerB.setStyle(util.extend({}, font.getStyle(), { 'font-family': font.family + ',serif' }));

      check();
    });
  };

  /**
   * @type {number}
   */
  FontFaceObserver.DEFAULT_TIMEOUT = 3000;

  /**
   * @type {null|boolean}
   */
  FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG = null;

  /**
   * @private
   * @return {string}
   */
  FontFaceObserver.prototype.getUserAgent = function () {
    return goog.global.navigator.userAgent;
  };

  /**
   * Returns true if this browser is WebKit and it has the fallback bug
   * which is present in WebKit 536.11 and earlier.
   *
   * @return {boolean}
   */
  FontFaceObserver.prototype.hasWebKitFallbackBug = function () {
    if (goog.isNull(FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG)) {
      var match = /AppleWeb[kK]it\/([0-9]+)(?:\.([0-9]+))/.exec(this.getUserAgent());

      FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG = !!match &&
                                            (parseInt(match[1], 10) < 536 ||
                                             (parseInt(match[1], 10) === 536 &&
                                              parseInt(match[2], 10) <= 11));
    }
    return FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG;
  };

  /**
   * @param {number} widthA
   * @param {number} widthB
   * @return {boolean}
   * @private
   */
  FontFaceObserver.prototype.isFallbackFont = function (widthA, widthB) {
    return widthA === this.cache.sansserif &&
           widthB === this.cache.serif;
  };

  /**
   * @param {number} widthA
   * @param {number} widthB
   * @return {boolean}
   * @private
   */
  FontFaceObserver.prototype.isLastResortFont = function (widthA, widthB) {
    return this.hasWebKitFallbackBug() &&
           ((widthA === this.cache.sansserif &&
             widthB === this.cache.sansserif) ||
            (widthA === this.cache.serif &&
             widthB === this.cache.serif) ||
            (widthA === this.cache.monospace &&
             widthB === this.cache.monospace));
  };
});
