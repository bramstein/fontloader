goog.provide('fontloader.FontFaceSet');

goog.require('fontloader.FontFaceSetLoadStatus');
goog.require('fontloader.FontFaceLoadStatus');
goog.require('fontloader.EventHandler');
goog.require('fontloader.CssValue');
goog.require('fontloader.css.UnicodeRange');

goog.scope(function () {
  var CssValue = fontloader.CssValue,
      UnicodeRange = fontloader.css.UnicodeRange,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus;

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
   * @private
   * @param {fontloader.FontFace} value
   * @return {number}
   */
  FontFaceSet.prototype.indexOf = function (value) {
    var index = -1;

    for (var i = 0; i < this.data.length; i++) {
      var item = this.data[i];

      if (item.equals && item.equals(value) || value === item) {
        return i;
      }
    }
    return index;
  };

  /**
   * @param {fontloader.FontFace} value
   * @return true if the given FontFace is in this set.
   */
  FontFaceSet.prototype['has'] = function (value) {
    return this.indexOf(value) !== -1;
  };

  /**
   * @param {fontloader.FontFace} value
   * @return true if the value was deleted, false otherwise.
   */
  FontFaceSet.prototype['delete'] = function (value) {
    var index = this.indexOf(value);

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
    var fontValue = CssValue.parse(font),
        matches = [],
        textRange = UnicodeRange.parse(opt_text || '\u0020');

    if (fontValue) {
      for (var i = 0; i < fontValue.family.length; i++) {
        var family = fontValue.family[i];

        for (var j = 0; j < this.data.length; j++) {
          var fontface = this.data[j];

          if (fontface['family'] === family &&
              fontface['style'] === fontValue.style &&
              fontface['variant'] === fontValue.variant &&
              // FIXME: We can't simply compare weights because 400 === normal, etc.
              fontface['weight'] === fontValue.weight) {
            var unicodeRange = new UnicodeRange(fontface['unicodeRange']);
            if (unicodeRange.intersects(textRange)) {
              matches.push(fontface);
            }
          }
        }
      }
    }

    return matches;
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
