goog.provide('fontloader.FontFace');

goog.require('fontloader.FontFaceLoadStatus');
goog.require('fontloader.FontFaceObserver');
goog.require('fontloader.UnicodeRange');

goog.require('fontloader.CSSValue');

goog.scope(function () {
  var FontFaceObserver = fontloader.FontFaceObserver,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus,
      UnicodeRange = fontloader.UnicodeRange,
      CSSValue = fontloader.CSSValue;

  /**
   * @constructor
   * @param {string} family
   * @param {string|fontloader.BinaryData} source
   * @param {fontloader.FontFaceDescriptors} descriptors
   */
  fontloader.FontFace = function (family, source, descriptors) {
    if (arguments.length !== 3) {
      throw new TypeError("Failed to construct 'FontFace': 3 arguments required, but only " + arguments.length + " present.");
    }

    var fontface = this;

    /**
     * @type {!fontloader.FontFaceLoadStatus}
     */
    this.loadStatus = fontloader.FontFaceLoadStatus.UNLOADED;

    /**
     * @type {string}
     */
    this.src;

    /**
     * @type {string}
     */
    this.testString;

    /**
     * @type {fontloader.UnicodeRange}
     */
    this.range;

    /**
     * @type {Element}
     */
    this.styleElement = document.createElement('style');

    document.head.appendChild(this.styleElement);

    this.styleElement.sheet.insertRule('@font-face{}', 0);

    Object.defineProperties(this, {
      'status': {
        get: function () {
          return this.loadStatus;
        }
      },
      'loaded': {
        get: function () {
          // FIXME
          return Promise.resolve(true);
        }
      },
      'family': {
        get: function () {
          return this.getCssProperty('fontFamily');;
        },
        set: function (value) {
          this.setCssProperty('fontFamily', value);
        }
      },
      'style': {
        get: function () {
          return this.getCssProperty('fontStyle');
        },
        set: function (value) {
          this.setCssProperty('fontStyle', value);
        }
      },
      'variant': {
        get: function () {
          return this.getCssProperty('fontVariant');
        },
        set: function (value) {
          this.setCssProperty('fontVariant', value);
        }
      },
      'weight': {
        get: function () {
          var weight = this.getCssProperty('fontWeight');

          if (weight === 'bold') {
            weight = '700';
          } else if (weight === 'normal') {
            weight = '400';
          }
          return weight;
        },
        set: function (value) {
          this.setCssProperty('fontWeight', value);
        }
      },
      'stretch': {
        get: function () {
          return this.getCssProperty('fontStretch');
        },
        set: function (value) {
          this.setCssProperty('fontStretch', value);
        }
      },
      'unicodeRange': {
        get: function () {
          return this.getCssProperty('unicodeRange');
        },
        set: function (value) {
          this.setCssProperty('unicodeRange', value);
          this.range = UnicodeRange.parse(value);
        }
      },
      'featureSettings': {
        get: function () {
          return this.getCssProperty('fontFeatureSettings') ||
                 this.getCssProperty('mozFontFeatureSettings') ||
                 this.getCssProperty('webkitFontFeatureSettings');
        },
        set: function (value) {
          this.setCssProperty('fontFeatureSettings', value);
          this.setCssProperty('mozFontFeatureSettings', value);
          this.setCssProperty('webkitFontFeatureSettings', value);
        }
      }
    });

    this['family'] = family;
    this['style'] = descriptors['style'] || 'normal';
    this['variant'] = descriptors['variant'] || 'normal';
    this['weight'] = descriptors['weight'] || 'normal';
    this['stretch'] = descriptors['stretch'] || 'normal';
    this['unicodeRange'] = descriptors['unicodeRange'] || 'U+0-10FFFF';
    this['featureSettings'] = descriptors['featureSettings'] || 'normal';

    if (typeof source === 'string') {
      this.src = source;
    } else if (source && typeof source.byteLength === "number") {
      var bytes = new Uint8Array(source),
          buffer = '';

      for (var i = 0, l = bytes.length; i < l; i++) {
        buffer += String.fromCharCode(bytes[i]);
      }

      // TODO: We could detect the format here and set the correct mime type and format
      this.src = 'url(data:font/opentype;base64,' + window.btoa(buffer) + ')';

      // trigger asynchronous loading
      setTimeout(function () {
        fontface['load']();
      }, 0);
    } else {
      throw new SyntaxError("Failed to construct 'FontFace': The source provided ('" + source + "') could not be parsed as a value list.");
    }
  };

  var FontFace = fontloader.FontFace;

  /**
   * @return {fontloader.UnicodeRange}
   */
  FontFace.prototype.getUnicodeRange = function () {
    return this.range;
  };

  /**
   * @param {string} key
   * @return {string}
   */
  FontFace.prototype.getCssProperty = function (key) {
    return this.styleElement.sheet.cssRules[0].style[key];
  };

  /**
   * @param {string} key
   * @param {string} value
   */
  FontFace.prototype.setCssProperty = function (key, value) {
    this.styleElement.sheet.cssRules[0].style[key] = value;
  };

  /**
   * @return {IThenable.<fontloader.FontFace>}
   */
  FontFace.prototype.load = function () {
    var fontface = this;

    if (fontface.loadStatus !== FontFaceLoadStatus.UNLOADED) {
      return fontface['promise'];
    } else {
      fontface.loadStatus = FontFaceLoadStatus.LOADING;

      fontface.setCssProperty('src', fontface.src);

      return new Promise(function (resolve, reject) {
        var observer = new FontFaceObserver(fontface).start();

        observer.then(function () {
          fontface.loadStatus = FontFaceLoadStatus.LOADED;
          resolve(fontface);
        }, function (r) {
          fontface.unload();
          fontface.loadStatus = FontFaceLoadStatus.ERROR;
          reject(r);
        });
      });
    }
  };

  /**
   * Unloads this FontFace by removing the stylesheet
   * from the document.
   */
  FontFace.prototype.unload = function () {
    document.head.removeChild(this.styleElement);
    this.loadStatus = FontFaceLoadStatus.UNLOADED;
  };

  /**
   * @return {string}
   */
  FontFace.prototype.getStyle = function () {
    return [
      'font-family:' + this['family'],
      'font-style:' + this['style'],
      'font-weight:' + this['weight'],
      'font-stretch:' + this['stretch'],
      'unicode-range:' + this['unicodeRange'],
      'font-variant:' + this['variant'],
      'font-feature-settings:' + this['featureSettings'],
      '-moz-font-feature-settings:' + this['featureSettings'],
      'webkit-font-feature-settings:' + this['featureSettings'],
      ''
    ].join(';');
  };
});
