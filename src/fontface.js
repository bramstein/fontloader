goog.provide('fontloader.FontFace');

goog.require('fontloader.FontFaceLoadStatus');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} family
   * @param {string|fontloader.BinaryData} source
   * @param {fontloader.FontFaceDescriptors} descriptors
   */
  fontloader.FontFace = function (family, source, descriptors) {
    if (arguments.length !== 3) {
      throw new TypeError("Failed to constructor 'FontFace': 3 arguments required, but only " + arguments.length + " present.");
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
      fontface.family = fontface.parse(family, FontFace.DescriptorParsers.FAMILY).toString();
      fontface.style = fontface.parse(descriptors['style'] || 'normal', FontFace.DescriptorParsers.STYLE).toString();
      fontface.weight = fontface.parse(descriptors['weight'] || 'normal', FontFace.DescriptorParsers.WEIGHT).toString();
      fontface.stretch = fontface.parse(descriptors['stretch'] || 'normal', FontFace.DescriptorParsers.STRETCH).toString();
      fontface.unicodeRange = fontface.parse(descriptors['unicodeRange'] || 'u+0-10FFFF', FontFace.DescriptorParsers.UNICODE_RANGE).toString();
      fontface.variant = fontface.parse(descriptors['variant'] || 'normal', FontFace.DescriptorParsers.VARIANT).toString();
      fontface.featureSettings = fontface.parse(descriptors['featureSettings'] || 'normal', FontFace.DescriptorParsers.FEATURE_SETTINGS).toString();


      if (typeof source === 'string') {
        fontface.src = fontface.parse(source, FontFace.DescriptorParsers.SRC).toString();
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
   * @enum {function(string):*}
   */
  FontFace.DescriptorParsers = {
    FAMILY: function (value) {
      return value;
    },
    STYLE: function (value) {
      return /^(italic|oblique|normal)$/.test(value) && value || null;
    },
    WEIGHT: function (value) {
      return /^(bold(er)?|lighter|[1-9]00|normal)$/.test(value) && value || null;
    },
    STRETCH: function (value) {
      return /^(((ultra|extra|semi)-)?(condensed|expanded)|normal)$/.test(value) && value || null;
    },
    UNICODE_RANGE: function (value) {
      var ranges = value.split(/\s*,\s*/);

      for (var i = 0; i < ranges.length; i++) {
        if (!/^(u\+[0-9a-f?]{1,6}(-[0-9a-f]{1,6})?)$/i.test(ranges[i])) {
          return null;
        }
      }

      return value;
    },
    VARIANT: function (value) {
      return /^(small-caps|normal)$/.test(value) && value || null;
    },
    FEATURE_SETTINGS: function (value) {
      return /^normal$/.test(value) && value || null;
    },
    SRC: function (value) {
      var srcRegExp = /\burl\((\'|\"|)([^\'\"]+?)\1\)( format\((\'|\"|)([^\'\"]+?)\4\))?/g,
          match = null,
          valid = false;

      while ((match = srcRegExp.exec(value))) {
        if (match[2]) {
          valid = true;
        }
      }

      if (valid) {
        return value;
      } else {
        return null;
      }
    }
  };

  /**
   * @private
   * @param {*} descriptor
   * @param {fontloader.FontFace.DescriptorParsers} parser
   * @return {*}
   */
  FontFace.prototype.parse = function (descriptor, parser) {
    if (typeof descriptor === 'string') {
      var result = parser(descriptor);

      if (result !== null) {
        return result;
      }
    }
    throw new SyntaxError("Failed to constructor 'FontFace': Failed to set '" + descriptor + "' as a property value.");
  };

  /**
   * @return {Promise}
   */
  FontFace.prototype.load = function () {
    return this.promise;
  };

  /**
   * Returns a CSS representation of this FontFace.
   *
   * @return {string}
   */
  FontFace.prototype.toCSS = function () {
    return '@font-face{' +
        'font-family:' + this.family + ';' +
        'font-style:' + this.style + ';' +
        'font-weight:' + this.weight + ';' +
        'font-stretch:' + this.stretch + ';' +
        'unicode-range:' + this.unicodeRange + ';' +
        'font-variant:' + this.variant + ';' +
        'font-feature-settings:' + this.featureSettings + ';' +
        'src:' + this.src + ';' +
      '}';
  };
});
