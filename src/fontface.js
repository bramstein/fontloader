goog.provide('fontloader.FontFace');

goog.require('fontloader.FontFaceLoadStatus');
goog.require('fontloader.FontFaceObserver');
goog.require('fontloader.UnicodeRange');

goog.require('fontloader.CSSFontFaceRule');
goog.require('fontloader.CSSValue');

goog.scope(function () {
  var FontFaceObserver = fontloader.FontFaceObserver,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus,
      UnicodeRange = fontloader.UnicodeRange,
      CSSFontFaceRule = fontloader.CSSFontFaceRule,
      CSSValue = fontloader.CSSValue;

  /**
   * @constructor
   * @param {string} family
   * @param {string|fontloader.BinaryData} source
   * @param {fontloader.FontFaceDescriptors} descriptors
   * @param {CSSRule=} opt_cssRule
   */
  fontloader.FontFace = function (family, source, descriptors, opt_cssRule) {
    if (arguments.length < 3) {
      throw new TypeError('Three arguments required, but only ' + arguments.length + ' present.');
    }

    /**
     * @private
     * @type {!fontloader.FontFaceLoadStatus}
     */
    this.loadStatus = fontloader.FontFaceLoadStatus.UNLOADED;

    /**
     * @type {string}
     */
    this.internalFamily = 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (goog.now() + Math.random() * 16) % 16 | 0;
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

    /**
     * @type {boolean}
     */
    this.cssConnected = false;

    /**
     * @type {string}
     */
    this.src;

    if (typeof source === 'string') {
      this.src = source;
    } else if (source && typeof source.byteLength === "number") {
      var bytes = new Uint8Array(/** @type {ArrayBuffer} */ (source)),
          buffer = '';

      for (var i = 0, l = bytes.length; i < l; i++) {
        buffer += String.fromCharCode(bytes[i]);
      }

      // TODO: We could detect the format here and set the correct mime type and format
      this.src = 'url(data:font/opentype;base64,' + window.btoa(buffer) + ')';
    } else if (typeof source !== 'string') {
      throw new SyntaxError('The source provided (\'' + source + '\') could not be parsed as a value list.');
    }

    /**
     * @type {fontloader.CSSFontFaceRule}
     */
    this.cssRule;

    if (opt_cssRule) {
      this.cssRule = new CSSFontFaceRule(opt_cssRule);
      this.cssConnected = true;
    } else {
      // If we do not get an explicit CSSRule we create a new stylesheet,
      // insert an empty rule and retrieve it.
      var style = document.createElement('style');

      style.appendChild(document.createTextNode('@font-face{}'));
      document.head.appendChild(style);

      this.cssRule = new CSSFontFaceRule(style.sheet.cssRules[0], this.src);
      this.cssConnected = false;
    }

    /**
     * @type {CSSStyleDeclaration}
     */
    this.properties = this.cssRule['style'];

    /**
     * @private
     * @type {fontloader.UnicodeRange}
     */
    this.range;

    /**
     * @type {fontloader.FontFace}
     */
    var fontface = this;

    /**
     * @private
     * @type {function(*)}
     */
    this.resolve;

    /**
     * @private
     * @type {function(*)}
     */
    this.reject;

    /**
     * @type {IThenable.<fontloader.FontFace>}
     */
    this.promise = new Promise(function (resolve, reject) {
      fontface.resolve = resolve;
      fontface.reject = reject;
    });

    /**
     * @type {string}
     */
    this.realFamily = family;

    Object.defineProperties(this, {
      'status': {
        get: function () {
          return this.loadStatus;
        }
      },
      'loaded': {
        get: function () {
          return this.promise.then(function (x) {
            return true;
          }, function (r) {
            return false;
          });
        }
      },
      'family': {
        get: function () {
          return this.realFamily;
        },
        set: function (value) {
          this.realFamily = value;
          if (this.cssConnected) {
            this.setCssFamily(value);
          }
        }
      },
      'style': {
        get: function () {
          return this.properties['font-style'];
        },
        set: function (value) {
          this.properties['font-style'] = value;
        }
      },
      'variant': {
        get: function () {
          return this.properties['font-variant'];
        },
        set: function (value) {
          this.properties['font-variant'] = value;
        }
      },
      'weight': {
        get: function () {
          return this.properties['font-weight'];
        },
        set: function (value) {
          this.properties['font-weight'] = value;
        }
      },
      'stretch': {
        get: function () {
          return this.properties['font-stretch'];
        },
        set: function (value) {
          this.properties['font-stretch'] = value;
        }
      },
      'unicodeRange': {
        get: function () {
          return this.properties['unicode-range'];
        },
        set: function (value) {
          this.properties['unicode-range'] = value;
          this.range = UnicodeRange.parse(value);
        }
      },
      'featureSettings': {
        get: function () {
          return this.properties['font-feature-settings'] ||
                 this.properties['-moz-font-feature-settings'] ||
                 this.properties['-webkit-font-feature-settings'];
        },
        set: function (value) {
          this.properties['font-feature-settings'] = value;
          this.properties['-moz-font-feature-settings'] = value;
          this.properties['-webkit-font-feature-settings'] = value;
        }
      }
    });

    this.setCssFamily(this.internalFamily);

    this['family'] = family;
    this['style'] = descriptors['style'] || 'normal';
    this['variant'] = descriptors['variant'] || 'normal';
    this['weight'] = descriptors['weight'] || 'normal';
    this['stretch'] = descriptors['stretch'] || 'normal';
    this['unicodeRange'] = descriptors['unicodeRange'] || 'u+0-10ffff';
    this['featureSettings'] = descriptors['featureSettings'] || 'normal';
  };

  var FontFace = fontloader.FontFace;

  /**
   * @return {fontloader.UnicodeRange}
   */
  FontFace.prototype.getUnicodeRange = function () {
    return this.range;
  };

  /**
   * @private
   * @param {string} name
   */
  FontFace.prototype.setCssFamily = function (name) {
    this.properties['font-family'] = '\'' + name + '\'';
  };

  /**
   * Called when you want to connect this FontFace instance
   * to the DOM. It internally sets the real font family name
   * on the @font-face declaration so that the fonts become
   * available (they've already been loaded, but under an
   * internal name).
   *
   * @return {IThenable.<fontloader.FontFace>}
   */
  FontFace.prototype.connect = function () {
    var fontface = this;

    this.cssConnected = true;

    // Because we rewrite the entire CSSRule in Firefox this actually
    // triggers a second request for the font, which is unfortunate.
    this.setCssFamily(this.realFamily);

    // Unfortunately, setting the font-family name to the real family
    // doesn't apply the font immediately in Firefox because the CSSRule
    // is rewritten and this is considered a new font (*sigh*). We trigger
    // a new round of font load detection to make sure we catch this.
    return new Promise(function (resolve, reject) {
      var observer = new FontFaceObserver(fontface.realFamily, fontface.properties['cssText'], fontface.range.getTestString());

      observer.start().then(function () {
        resolve(fontface);
      }, function (r) {
        reject(r);
      });
    });
  };

  /**
   * @return {IThenable.<fontloader.FontFace>}
   */
  FontFace.prototype.load = function () {
    var fontface = this;

    if (fontface.loadStatus !== FontFaceLoadStatus.UNLOADED) {
      return this.promise;
    } else {
      fontface.loadStatus = FontFaceLoadStatus.LOADING;

      var observer = new FontFaceObserver(this.internalFamily, this.properties['cssText'], this.range.getTestString());

      observer.start().then(function () {
        fontface.loadStatus = FontFaceLoadStatus.LOADED;
        fontface.resolve(fontface);
      }, function (r) {
        fontface.loadStatus = FontFaceLoadStatus.ERROR;
        fontface.reject(r);
      });

      return this.promise;
    }
  };
});
