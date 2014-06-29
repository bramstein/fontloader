goog.provide('fontloader.FontFaceSet');

goog.require('fontloader.FontFaceSetLoadStatus');
goog.require('fontloader.FontFaceLoadStatus');
goog.require('fontloader.EventHandler');
goog.require('fontloader.UnicodeRange');
goog.require('fontloader.CSSValue');

goog.scope(function () {
  var UnicodeRange = fontloader.UnicodeRange,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus,
      CSSValue = fontloader.CSSValue;

  /**
   * @constructor
   */
  fontloader.FontFaceSet = function () {
    /**
     * @type {Array.<fontloader.FontFace>}
     */
    this.data = [];

    /**
     * @type {number}
     */
    this['size'] = 0;

    /**
     * @type {fontloader.FontFaceSetLoadStatus}
     */
    this['status'] = fontloader.FontFaceSetLoadStatus.LOADED;

    /**
     * @type {fontloader.EventHandler}
     */
    this['onloading'] = goog.nullFunction;

    /**
     * @type {fontloader.EventHandler}
     */
    this['onloadingdone'] = goog.nullFunction;

    /**
     * @type {fontloader.EventHandler}
     */
    this['onloadingerror'] = goog.nullFunction;

    /**
     * @type {IThenable}
     */
    this['ready'] = new Promise(function (resolve, reject) {

    });
  };

  var FontFaceSet = fontloader.FontFaceSet;

  /**
   * @param {fontloader.FontFace} value
   */
  FontFaceSet.prototype['add'] = function (value) {
    if (!this['has'](value)) {
      this.data.push(value);
      this['size'] += 1;
    }
  };

  /**
   * @param {fontloader.FontFace} value
   * @return true if the given FontFace is in this set.
   */
  FontFaceSet.prototype['has'] = function (value) {
    return this.data.indexOf(value) !== -1;
  };

  /**
   * @param {fontloader.FontFace} value
   * @return true if the value was deleted, false otherwise.
   */
  FontFaceSet.prototype['delete'] = function (value) {
    var index = this.data.indexOf(value);

    if (index !== -1) {
      this.data.splice(index, 1);
      this['size'] -= 1;
      return true;
    } else {
      return false;
    }
  };

  /**
   * Removes all values from this set.
   */
  FontFaceSet.prototype['clear'] = function () {
    this.data = [];
    this['size'] = 0;
  };

  /**
   * @param {function(fontloader.FontFace, fontloader.FontFace, fontloader.FontFaceSet)} callbackFn
   * @param {Object=} opt_thisArg
   */
  FontFaceSet.prototype['forEach'] = function (callbackFn, opt_thisArg) {
    for (var i = 0; i < this.data.length; i++) {
      callbackFn.call(opt_thisArg, this.data[i], this.data[i], this);
    }
  };

  /**
   * @param {string} font
   * @param {string=} opt_text
   * @return {Array.<fontloader.FontFace>} Returns all matching FontFace's in this set
   */
  FontFaceSet.prototype.match = function (font, opt_text) {
    function normalizeWeight(weight) {
      if (weight === 'bold') {
        return '700';
      } else if (weight === 'normal') {
        return '400';
      } else {
        return weight;
      }
    }

    var properties = CSSValue.parseFont(font),
        textRange = UnicodeRange.parseString(opt_text || '\u0020');

    return this.data.filter(function (fontface) {
      var families = properties.family;

      for (var i = 0; i < families.length; i++) {
        if (fontface['family'] === families[i] &&
            fontface['style'] === properties.style &&
            fontface['variant'] === properties.variant &&
            normalizeWeight(fontface['weight']) === normalizeWeight(properties.weight) &&
            fontface.getUnicodeRange().intersects(textRange)) {
          return true;
        }
      }
      return false;
    });
  };

  /**
   * @param {string} font
   * @param {string=} opt_text
   * @return {IThenable}
   */
  FontFaceSet.prototype['load'] = function (font, opt_text) {
    var matches = this.match(font, opt_text),
        promises = [];

    for (var i = 0; i < matches.length; i++) {
      promises.push(matches[i].load());
    }

    return Promise.all(promises);
  };

  /**
   * @param {string} font
   * @param {string=} opt_text
   * @return {boolean}
   */
  FontFaceSet.prototype['check'] = function (font, opt_text) {
    var matches = this.match(font, opt_text);

    if (matches.length === 0) {
      return false;
    } else {
      for (var i = 0; i < matches.length; i++) {
        if (matches[i]['status'] !== FontFaceLoadStatus.LOADED) {
          return false;
        }
      }
      return true;
    }
  };
});
