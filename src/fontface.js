goog.provide('fontloader.FontFace');

goog.require('fontloader.FontFaceLoadStatus');
goog.require('fontloader.FontFaceLoader');
goog.require('fontloader.CssValue');
goog.require('fontloader.util');

goog.scope(function () {
  var FontFaceLoader = fontloader.FontFaceLoader,
      CssValue = fontloader.CssValue,
      Parsers = CssValue.Parsers,
      util = fontloader.util;

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
    this.status = fontloader.FontFaceLoadStatus.UNLOADED;

    /**
     * @type {string}
     */
    this.family;

    /**
     * @type {string}
     */
    this.style;

    /**
     * @type {string}
     */
    this.weight;

    /**
     * @type {string}
     */
    this.stretch;

    /**
     * @type {string}
     */
    this.unicodeRange;

    /**
     * @type {string}
     */
    this.variant;

    /**
     * @type {string}
     */
    this.featureSettings;

    /**
     * @type {string}
     */
    this.src;

    /**
     * @type {string}
     */
    this.testString;

    /**
     * @type {Promise}
     */
    this.promise = new Promise(function (resolve, reject) {
      fontface.family = fontface.parse(family, Parsers.FAMILY).toString();
      fontface.style = fontface.parse(descriptors['style'] || 'normal', Parsers.STYLE).toString();
      fontface.weight = fontface.parse(descriptors['weight'] || 'normal', Parsers.WEIGHT).toString();
      fontface.stretch = fontface.parse(descriptors['stretch'] || 'normal', Parsers.STRETCH).toString();
      fontface.unicodeRange = fontface.parse(descriptors['unicodeRange'] || 'u+0-10FFFF', Parsers.UNICODE_RANGE).toString();
      fontface.variant = fontface.parse(descriptors['variant'] || 'normal', Parsers.VARIANT).toString();
      fontface.featureSettings = fontface.parse(descriptors['featureSettings'] || 'normal', Parsers.FEATURE_SETTINGS).toString();

      fontface.fontFaceLoader = new FontFaceLoader(fontface);

      if (typeof source === 'string') {
        fontface.src = fontface.parse(source, Parsers.SRC).toString();
      } else if (source && typeof source.byteLength === "number") {
        var bytes = new Uint8Array(source),
            buffer = '';

        for (var i = 0, l = bytes.length; i < l; i++) {
          buffer += String.fromCharCode(bytes[i]);
        }

        // TODO: We could detect the format here and set the correct mime type
        fontface.src = 'url(data:font/opentype;base64,' + window.btoa(buffer) + ')';

        fontface.status = fontloader.FontFaceLoadStatus.LOADING;
      } else {
        throw new SyntaxError("Failed to construct 'FontFace': The source provided ('" + source + "') could not be parsed as a value list.");
      }
    });
  };

  var FontFace = fontloader.FontFace;

  /**
   * @private
   * @param {*} descriptor
   * @param {fontloader.CssValue.Parsers} parser
   * @return {*}
   */
  FontFace.prototype.parse = function (descriptor, parser) {
    if (typeof descriptor === 'string') {
      var result = parser(descriptor);

      if (result !== null) {
        return result;
      }
    }
    throw new SyntaxError("Failed to construct 'FontFace': Failed to set '" + descriptor + "' as a property value.");
  };

  /**
   * @return {IThenable}
   */
  FontFace.prototype.load = function () {
    var that = this;
    return that.promise.then(function () {
      return that.fontFaceLoader.load();
    });
  };

  /**
   * Returns all the CSS properties to apply
   * this FontFace to an element.
   *
   * @return {fontloader.CssValue}
   */
  FontFace.prototype.getStyle = function () {
    return {
      'font-family': this.family,
      'font-style': this.style,
      'font-weight': this.weight,
      'font-stretch': this.stretch,
      'font-variant': this.variant,
      'font-feature-settings': this.featureSettings,
      '-moz-font-feature-settings': this.featureSettings,
      '-webkit-font-feature-settings': this.featureSettings
    };
  };

  /**
   * Returns a CSS representation of this FontFace.
   *
   * @return {string}
   */
  FontFace.prototype.toCss = function () {
    return '@font-face{' +
      CssValue.serialize(util.extend(this.getStyle, {
        'unicode-range': this.unicodeRange,
        'src': this.src
      })) +
    '}';
  };
});
