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
     * @type {fontloader.FontFaceLoadStatus}
     */
    fontface.status = fontloader.FontFaceLoadStatus.UNLOADED;

    /**
     * @private
     * @type {string}
     */
    fontface.family = family; // TODO: Validate this.

    /**
     * @type {string}
     */
    fontface.style = fontface.validate(descriptors['style'], FontFace.DescriptorValidator.STYLE) || "normal";

    /**
     * @type {string}
     */
    fontface.weight = fontface.validate(descriptors['weight'], FontFace.DescriptorValidator.WEIGHT) || "normal";

    /**
     * @type {string}
     */
    fontface.stretch = fontface.validate(descriptors['stretch'], FontFace.DescriptorValidator.STRETCH) || "normal";

    /**
     * @type {string}
     */
    fontface.unicodeRange = fontface.validate(descriptors['unicodeRange'], FontFace.DescriptorValidator.UNICODE_RANGE) || "u+0-10FFFF";

    /**
     * @type {string}
     */
    fontface.variant = fontface.validate(descriptors['variant'], FontFace.DescriptorValidator.VARIANT) || "normal";

    /**
     * @type {string}
     */
    fontface.featureSettings = fontface.validate(descriptors['featureSettings'], FontFace.DescriptorValidator.FEATURE_SETTINGS) || "normal";

    /**
     * @private
     * @type {Array.<string>?}
     */
    fontface.urls = null;

    /**
     * @private
     * @type {fontloader.BinaryData?}
     */
    fontface.data = null;

    if (typeof source === 'string') {
      var urlRegExp = /\burl\((\'|\"|)([^\'\"]+?)\1\)/g,
          urls = [],
          match = null;

      while ((match = urlRegExp.exec(source))) {
        urls.push(match[2]);
      }

      if (urls.length) {
        fontface.urls = urls;
      } else {
        throw new SyntaxError("Failed to construct 'FontFace': The source provided ('" + source + "') could not be parsed as a value list.");
      }
    } else {
      fontface.data = /** @type {fontloader.BinaryData} */ (source);
    }
  };

  var FontFace = fontloader.FontFace;

  /**
   * @private
   * @type {Object.<string, RegExp>}
   */
  FontFace.DescriptorValidator = {
    STYLE: /^(italic|oblique|normal)$/,
    WEIGHT: /^(bold(er)?|lighter|[1-9]00|normal)$/,
    STRETCH: /^(((ultra|extra|semi)-)?(condensed|expanded)|normal)$/,
    UNICODE_RANGE: /^(u\+[0-9a-f?]{1,6}(-[0-9a-f]{1,6})?)$/i,
    VARIANT: /^(small-caps|normal)$/,
    FEATURE_SETTINGS: /^normal$/ // TODO: Fix this and variant
  };

  /**
   * Validates and returns a descriptor. Throws a SyntaxError
   * if the descriptor does not validate and returns null if
   * the descriptor is not present.
   *
   * @private
   * @param {string?} descriptor
   * @param {RegExp} validator
   *
   * @return {string?}
   */
  FontFace.prototype.validate = function (descriptor, validator) {
    if (descriptor) {
      if (validator.test(descriptor)) {
        return descriptor;
      } else {
        throw new SyntaxError("Failed to construct 'FontFace': Failed to set '" + descriptor + "' as a property value.");
      }
    } else {
      return null;
    }
  };

  /**
   * @return {Promise}
   */
  FontFace.prototype.load = function () {
    return new Promise(function (resolve, reject) {
    });
  };
});
