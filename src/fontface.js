goog.provide('fontloader.FontFace');

goog.require('fontloader.FontFaceLoadStatus');
goog.require('fontloader.FontFaceLoader');
goog.require('fontloader.CssValue');
goog.require('fontloader.util');

goog.scope(function () {
  var FontFaceLoader = fontloader.FontFaceLoader,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus,
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
    this['status'] = fontloader.FontFaceLoadStatus.UNLOADED;

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
     * This attribute is non-standard and should not be used.
     *
     * @type {string}
     */
    this.src;

    /**
     * This attribute is non-standard and should not be used.
     *
     * @type {string}
     */
    this.testString;

    /**
     * This attribute is non-standard and should not be used.
     *
     * @type {Promise}
     */
    this['promise'] = new Promise(function (resolve, reject) {
      // TODO: Move error handling into a module so each parser can throw exceptions cheaply
      // and we can get rid of fontface.parse.
      fontface['family'] = fontface.parse(family, Parsers.FAMILY).toString(); // FIXME: This should be quoted if necessary.
      fontface['style'] = fontface.parse(descriptors['style'] || 'normal', Parsers.STYLE).toString();
      fontface['weight'] = fontface.parse(descriptors['weight'] || 'normal', Parsers.WEIGHT).toString();
      fontface['stretch'] = fontface.parse(descriptors['stretch'] || 'normal', Parsers.STRETCH).toString();
      fontface['unicodeRange'] = fontface.parse(descriptors['unicodeRange'] || 'u+0-10FFFF', Parsers.UNICODE_RANGE).toString();
      fontface['variant'] = fontface.parse(descriptors['variant'] || 'normal', Parsers.VARIANT).toString();
      fontface['featureSettings'] = fontface.parse(descriptors['featureSettings'] || 'normal', Parsers.FEATURE_SETTINGS).toString();

      if (typeof source === 'string') {
        fontface['src'] = fontface.parse(source, Parsers.SRC).toString();
        resolve(fontface);
      } else if (source && typeof source.byteLength === "number") {
        var bytes = new Uint8Array(source),
            buffer = '';

        for (var i = 0, l = bytes.length; i < l; i++) {
          buffer += String.fromCharCode(bytes[i]);
        }

        // TODO: We could detect the format here and set the correct mime type
        fontface['src'] = 'url(data:font/opentype;base64,' + window.btoa(buffer) + ')';
        fontface.load();
        resolve(fontface);
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
    var fontface = this;

    if (fontface['status'] !== FontFaceLoadStatus.UNLOADED) {
      return fontface['promise'];
    } else {
      fontface['status'] = FontFaceLoadStatus.LOADING;

      return fontface['promise'].then(function () {
        var loader = new FontFaceLoader(fontface).load();

        loader.then(function () {
          fontface['status'] = FontFaceLoadStatus.LOADED;
        }, function () {
          fontface['status'] = FontFaceLoadStatus.ERROR;
        });
        return loader;
      });
    }
  };

  /**
   * Returns all the CSS properties to apply
   * this FontFace to an element.
   *
   * @return {fontloader.CssValue}
   */
  FontFace.prototype.getStyle = function () {
    var fontface = this;

    return {
      'font-family': fontface['family'],
      'font-style': fontface['style'],
      'font-weight': fontface['weight'],
      'font-stretch': fontface['stretch'],
      'font-variant': fontface['variant'],
      'font-feature-settings': fontface['featureSettings'],
      '-moz-font-feature-settings': fontface['featureSettings'],
      '-webkit-font-feature-settings': fontface['featureSettings']
    };
  };

  /**
   * Returns a CSS representation of this FontFace.
   *
   * @return {string}
   */
  FontFace.prototype.toCss = function () {
    var fontface = this;

    return '@font-face{' +
      CssValue.serialize(util.extend(fontface.getStyle(), {
        'unicode-range': fontface['unicodeRange'],
        'src': fontface['src']
      })) +
    '}';
  };
});
