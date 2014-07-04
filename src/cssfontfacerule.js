goog.provide('fontloader.CSSFontFaceRule');

goog.scope(function () {
  /**
   * Convenience wrapper around CSSFontFaceRule's. Firefox
   * and Internet Explorer do not support setting properties on
   * the style attribute of a CSSRule, so we work around it by
   * rewriting the rule each time a property is updated.
   *
   * Hopefully we'll be able to remove this wrapper in the
   * future. In the meantime this lets us use the correct API
   * for making these changes.
   *
   * @constructor
   * @param {CSSRule} cssRule
   * @param {string=} opt_src
   */
  fontloader.CSSFontFaceRule = function (cssRule, opt_src) {
    /**
     * @type {CSSRule}
     */
    this.cssRule = cssRule;

    /**
     * @dict
     */
    var style = {};

    /**
     * @type {fontloader.CSSFontFaceRule}
     */
    var that = this;

    [ 'font-family',
      'font-style',
      'font-variant',
      'font-weight',
      'font-stretch',
      'unicode-range',
      'font-feature-settings',
      '-moz-font-feature-settings',
      '-webkit-font-feature-settings'
    ].forEach(function (key) {
      Object.defineProperty(style, key, {
        get: function () {
          return that.getPropertyValue(key);
        },
        set: function (value) {
          that.setProperty(key, value);
        }
      });
    });

    this.src = opt_src;

    // We treat src special because even though Internet Explorer
    // supports setting of the "src" property, it always returns the
    // empty string when getting the value. Since "src" is the only
    // write-only property in FontFace we work around it by caching
    // a local copy here so it appears to work.
    Object.defineProperty(style, 'src', {
      get: function () {
        return that.src;
      },
      set: function (value) {
        that.src = value;
      }
    });

    Object.defineProperty(style, 'cssText', {
      get: function () {
        return that.getCssText();
      }
    });

    Object.defineProperties(this, {
      'style': {
        get: function () {
          return style;
        }
      },
      'cssText': {
        get: function () {
          return '@font-face{' + this.getCssText() + '}';
        }
      }
    });
  };

  var CSSFontFaceRule = fontloader.CSSFontFaceRule;

  /**
   * @type {null|boolean}
   */
  CSSFontFaceRule.SUPPORTS_PROPERTIES = !(/Gecko|MSIE|Trident/.test(goog.global.navigator.userAgent));

  /**
   * @private
   * @return {number}
   */
  CSSFontFaceRule.prototype.indexOf = function () {
    var styleSheet = this.cssRule.parentStyleSheet;

    for (var i = 0; i < styleSheet.cssRules.length; i++) {
      if (styleSheet.cssRules[i] === this.cssRule) {
        return i;
      }
    }

    return -1;
  };

  /**
   * @return {string}
   */
  CSSFontFaceRule.prototype.getCssText = function () {
    var cssText = '';

    for (var i = 0; i < this.cssRule.style.length; i++) {
      cssText += this.cssRule.style[i] + ':' + this.getPropertyValue(this.cssRule.style[i]) + ';';
    }

    if (this.src) {
      cssText += 'src:' + this.src + ';';
    }

    return cssText;
  };

  /**
   * @private
   * @param {string} name
   * @return {string|null}
   */
  CSSFontFaceRule.prototype.getPropertyValue = function (name) {
    var value = this.cssRule.style.getPropertyValue(name);

    // Firefox doesn't appear to support setting font-variant. Instead
    // it always returns an empty string when asked for the font-variant
    // property. We return 'normal' instead so the rest of the code can
    // assume everything is normalised.
    if (value === '' && name !== 'unicode-range') {
      return 'normal';
    } else if (value === '') {
      return 'u+0-10ffff';
    } else {
      return value;
    }
  };

  /**
   * @private
   * @param {string} name
   * @param {string} value
   */
  CSSFontFaceRule.prototype.setProperty = function (name, value) {
    if (CSSFontFaceRule.SUPPORTS_PROPERTIES) {
      this.cssRule.style[name] = value;
    } else {
      var cssText = this.getCssText();

      cssText += name + ':' + value;

      this.update('@font-face{' + cssText + '}');
    }
  };

  /**
   * @private
   */
  CSSFontFaceRule.prototype.delete = function () {
    var index = this.indexOf();

    if (index !== -1) {
      this.cssRule.parentStyleSheet.deleteRule(index);
    }
  };

  /**
   * @private
   * @param {string} cssText
   */
  CSSFontFaceRule.prototype.update = function (cssText) {
    var index = this.indexOf();

    if (index !== -1) {
      var parentStyleSheet = this.cssRule.parentStyleSheet;

      parentStyleSheet.deleteRule(index);
      parentStyleSheet.insertRule(cssText, index);
      this.cssRule = parentStyleSheet.cssRules[index];
    }
  };
});
