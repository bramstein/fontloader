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
   * @param {CSSRule=} opt_cssRule
   */
  fontloader.FontFace = function (family, source, descriptors, opt_cssRule) {
    if (arguments.length !== 3) {
      throw new TypeError('Three arguments required, but only ' + arguments.length + ' present.');
    }

    /**
     * @private
     * @type {!fontloader.FontFaceLoadStatus}
     */
    this.loadStatus = fontloader.FontFaceLoadStatus.UNLOADED;

    /**
     * @type {CSSRule}
     */
    this.cssRule;

    if (opt_cssRule) {
      this.cssRule = opt_cssRule;
    } else {
      // If we do not get an explicit CSSRule we create a new stylesheet,
      // insert an empty rule and retrieve it.
      var style = document.createElement('style');

      style.appendChild(document.createTextNode('@font-face{}'));
      document.head.appendChild(style);

      this.cssRule = style.sheet.cssRules[0];
    }

    /**
     * @private
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
     * @private
     * @dict
     */
    this.properties = {
      'font-family': family,
      'font-style': descriptors['style'] || 'normal',
      'font-variant': descriptors['variant'] || 'normal',
      'font-weight': descriptors['weight'] || 'normal',
      'unicode-range': descriptors['unicodeRange'] || 'U+0-10FFFF',
      'font-feature-settings': descriptors['featureSettings'] || 'normal',
      '-moz-font-feature-settings': descriptors['featureSettings'] || 'normal',
      '-webkit-font-feature-settings': descriptors['featureSettings'] || 'normal'
    };

    /**
     * @private
     * @type {fontloader.UnicodeRange}
     */
    this.range = UnicodeRange.parse(this.properties['unicode-range']);

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
          return CSSValue.parseFamily(this.properties['font-family'])[0];
        },
        set: function (value) {
          this.properties['font-family'] = value;
          this.updateCss();
        }
      },
      'style': {
        get: function () {
          return this.properties['font-style'];
        },
        set: function (value) {
          this.properties['font-style'] = value;
          this.updateCss();
        }
      },
      'variant': {
        get: function () {
          return this.properties['font-variant'];
        },
        set: function (value) {
          this.properties['font-variant'] = value;
          this.updateCss();
        }
      },
      'weight': {
        get: function () {
          return this.properties['font-weight'];
        },
        set: function (value) {
          this.properties['font-weight'] = value;
          this.updateCss();
        }
      },
      'stretch': {
        get: function () {
          return this.properties['font-stretch'];
        },
        set: function (value) {
          this.properties['font-stretch'] = value;
          this.updateCss();
        }
      },
      'unicodeRange': {
        get: function () {
          return this.properties['unicode-range'];
        },
        set: function (value) {
          this.properties['unicode-range'] = value;
          this.range = UnicodeRange.parse(value);
          this.updateCss();
        }
      },
      'featureSettings': {
        get: function () {
          return this.properties['font-feature-settings'];
        },
        set: function (value) {
          this.properties['font-feature-settings'] = value;
          this.properties['-moz-font-feature-settings'] = value;
          this.properties['-webkit-font-feature-settings'] = value;
          this.updateCss();
        }
      }
    });

    this.updateCss();
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
   */
  FontFace.prototype.updateCss = function () {
    var style = this.getStyle(),
        styleSheet = this.cssRule.parentStyleSheet,
        index = this.indexOfRule(styleSheet, this.cssRule);

    style += 'src:' + this.src + ';';

    if (index !== -1) {
      styleSheet.deleteRule(index);
      styleSheet.insertRule('@font-face{' + style + '}', index);
      this.cssRule = styleSheet.cssRules[index];
    } else {
      throw new Error('FontFace references CSSRule that is no longer present.');
    }
  };

  /**
   * @param {CSSStyleSheet} styleSheet
   * @param {CSSRule} cssRule
   * @return {number}
   */
  FontFace.prototype.indexOfRule = function (styleSheet, cssRule) {
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
      if (styleSheet.cssRules[i] === cssRule) {
        return i;
      }
    }
    return -1;
  };

  /**
   * @private
   * @return {string}
   */
  FontFace.prototype.guid = function () {
    var d = Date.now();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
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

      var observer = new FontFaceObserver(this['family'], this.getStyle(), this.range.getTestString());

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

  /**
   * Unloads this FontFace by removing the stylesheet
   * rule from the document.
   */
  FontFace.prototype.unload = function () {
    var styleSheet = this.cssRule.parentStyleSheet,
        index = this.indexOfRule(styleSheet, this.cssRule);

    if (index !== -1) {
      styleSheet.deleteRule(index);
      styleSheet.insertRule('@font-face{}', index);
      this.cssRule = styleSheet.cssRules[index];
    }
    this.loadStatus = FontFaceLoadStatus.UNLOADED;
  };

  /**
   * @return {string}
   */
  FontFace.prototype.getStyle = function () {
    var style = '';

    Object.keys(this.properties).forEach(function (property) {
      style += property + ':' + this.properties[property] + ';';
    }, this);

    return style;
  };
});
