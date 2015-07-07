goog.provide('fl.FontFaceSet');

goog.require('fl.FontFaceSetLoadStatus');

goog.require('cssvalue.Font');

goog.scope(function () {
  var FontFaceSetLoadStatus = fl.FontFaceSetLoadStatus,
      Font = cssvalue.Font;

  /**
   * @constructor
   */
  fl.FontFaceSet = function () {

    /**
     * @type {Array.<fl.FontFace>}
     */
    this.fonts = [];

    /**
     * @type {!fl.FontFaceSetLoadStatus}
     */
    this.loadStatus = FontFaceSetLoadStatus.LOADED;

    Object.defineProperties(this, {
      'status': {
        get: function () {
          return this.loadStatus;
        }
      },
      'size': {
        get: function () {
          return this.fonts.length;
        }
      }
    });
  };

  var FontFaceSet = fl.FontFaceSet;

  /**
   * @param {!fl.FontFace} font
   *
   * return {fl.FontFaceSet}
   */
  FontFaceSet.prototype['add'] = function (font) {
    if (!this['has'](font)) {
      font.insert();
      this.fonts.push(font);
    }
  };

  /**
   * @param {!fl.FontFace} font
   *
   * @return {boolean}
   */
  FontFaceSet.prototype['delete'] = function (font) {
    var index = this.fonts.indexOf(font);

    if (index !== -1) {
      font.remove();
      this.fonts.splice(index, 1);
      return true;
    } else {
      return false;
    }
  };

  FontFaceSet.prototype['clear'] = function () {
    this.fonts = [];
  };

  /**
   * @param {!fl.FontFace} font
   *
   * @return {boolean}
   */
  FontFaceSet.prototype['has'] = function (font) {
    return this.fonts.indexOf(font) !== -1;
  };

  /**
   * @param {function(fl.FontFace, number, fl.FontFaceSet)} fn
   */
  FontFaceSet.prototype['forEach'] = function (fn) {
    var set = this;

    this.fonts.forEach(function (font, index) {
      fn(font, index, set);
    });
  };

  /**
   * @param {string} font
   * @param {string=} opt_text
   *
   * @return {!Array.<!fl.FontFace>|null}
   */
  FontFaceSet.prototype.match = function (font, opt_text) {
    function normalize(weight) {
      if (weight === 'bold') {
        return 700;
      } else if (weight === 'normal') {
        return 400;
      } else {
        return weight;
      }
    }

    var properties = Font.parse(font);

    if (properties === null) {
      return null;
    }

    // TODO: match on opt_text
    return this.fonts.filter(function (f) {
      var families = properties.family;

      for (var i = 0; i < families.length; i++) {
        if (f['family'] === families[i] &&
            f['style'] === properties.style &&
            f['stretch'] === properties.stretch &&
            normalize(f['weight']) === normalize(properties.weight)) {
          return true;
        }
      }
      return false;
    });
  };

  /**
   * @param {string} font
   * @param {string=} opt_text
   *
   * @return {!Promise.<!Array.<fl.FontFace>>}
   */
  FontFaceSet.prototype['load'] = function (font, opt_text) {
    var set = this,
        matches = this.match(font, opt_text);

    if (matches === null) {
      return Promise.reject([]);
    } else if (matches.length) {
      set.loadStatus = FontFaceSetLoadStatus.LOADING;

      return Promise.all(matches.map(function (font) {
        return font.load();
      })).then(function () {
        set.loadStatus = FontFaceSetLoadStatus.LOADED;
        return matches;
      }).catch(function () {
        set.loadStatus = FontFaceSetLoadStatus.LOADED;
        return matches;
      });
    } else {
      return Promise.resolve([]);
    }
  };

  /**
   * @param {string} font
   * @param {string} opt_text
   *
   * @return {boolean}
   */
  FontFaceSet.prototype['check'] = function (font, opt_text) {
    var matches = this.match(font, opt_text);

    if (matches.length === 0) {
      return false;
    } else {
      for (var i = 0; i < matches.length; i++) {
        if (matches[i]['status'] !== "loaded") {
          return false;
        }
      }
      return true;
    }
  };
});
