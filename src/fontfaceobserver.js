goog.provide('fontloader.FontFaceObserver');

goog.require('fontloader.Ruler');

goog.scope(function () {
  var Ruler = fontloader.Ruler;

  /**
   * @constructor
   * @param {fontloader.FontFace} font
   */
  fontloader.FontFaceObserver = function (font) {
    /**
     * @type {fontloader.FontFace}
     */
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
    this.text = font.getUnicodeRange().getTestString();

    this.init();
  };

  var FontFaceObserver = fontloader.FontFaceObserver;

  /**
   * @private
   */
  FontFaceObserver.prototype.init = function () {
    var ruler = new Ruler(this.text),
        style = this.font.getStyle();

    ruler.insert();

    ruler.setStyle(style + 'font-family: serif');
    this.cache.serif = ruler.getWidth();

    ruler.setStyle(style + 'font-family: sans-serif');
    this.cache.sansserif = ruler.getWidth();

    ruler.setStyle(style + 'font-family: monospace');
    this.cache.monospace = ruler.getWidth();

    ruler.remove();
  };

  /**
   * @return {IThenable.<fontloader.FontFace>}
   */
  FontFaceObserver.prototype.start = function () {
    var that = this,
        font = that.font,
        started = goog.now(),
        rulerA = new Ruler(that.text),
        rulerB = new Ruler(that.text);

    return new Promise(function (resolve, reject) {
       function check() {
        var widthA = rulerA.getWidth(),
            widthB = rulerB.getWidth();

        if (that.isFallbackFont(widthA, widthB) || that.isLastResortFont(widthA, widthB)) {
          if (goog.now() - started >= FontFaceObserver.DEFAULT_TIMEOUT) {
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
          resolve(font);
        }
      }

      var style = font.getStyle();

      rulerA.insert();
      rulerA.setStyle(style + 'font-family:' + font['family'] + ',sans-serif');

      rulerB.insert();
      rulerB.setStyle(style + 'font-family:' + font['family'] + ',serif');

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
