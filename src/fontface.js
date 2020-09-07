goog.provide('fl.FontFace');

goog.require('fl.FontFaceLoadStatus');
goog.require('fl.FontFormat');

goog.require('cssvalue.Src');
goog.require('net.fetch');
goog.require('dom');

goog.scope(function () {
  var FontFaceLoadStatus = fl.FontFaceLoadStatus,
      FontFormat = fl.FontFormat,
      Src = cssvalue.Src,
      fetch = net.fetch;

  /**
   * @constructor
   *
   * @param {string} family
   * @param {fl.BinaryData|string} source
   * @param {fl.FontFaceDescriptors=} opt_descriptors
   */
  fl.FontFace = function (family, source, opt_descriptors) {
    var fontface = this,
        descriptors = opt_descriptors || {};

    /**
     * @type {fl.BinaryData|string}
     */
    this.source = source;

    /**
     * @type {ArrayBuffer}
     */
    this.buffer = null;

    /**
     * @type {Array.<cssvalue.Src.Value>}
     */
    this.urls = [];

    /**
     * @type {function(fl.FontFace)}
     */
    this.resolveLoad;

    /**
     * @type {function(fl.FontFace)}
     */
    this.rejectLoad;

    /**
     * @type {Promise.<fl.FontFace>}
     */
    this.promise = new Promise(function (resolve, reject) {
      fontface.resolveLoad = resolve;
      fontface.rejectLoad = reject;
    });

    /**
     * @type {fl.FontFaceLoadStatus}
     */
    this.loadStatus = FontFaceLoadStatus.UNLOADED;

    /**
     * @type {CSSRule|null}
     */
    this.rule = null;

    Object.defineProperties(this, {
      'family': {
        get: function () {
          return family;
        }
      },
      'style': {
        get: function () {
          return descriptors.style || 'normal';
        }
      },
      'weight': {
        get: function () {
          return descriptors.weight || 'normal';
        }
      },
      'stretch': {
        get: function () {
          return descriptors.stretch || 'normal';
        }
      },
      'display': {
        get: function () {
          return descriptors.display || 'auto';
        }
      },
      'unicodeRange': {
        get: function () {
          return descriptors.unicodeRange || 'U+0-10FFFF';
        }
      },
      'variant': {
        get: function () {
          return descriptors.variant || 'normal';
        }
      },
      'featureSettings': {
        get: function () {
          return descriptors.featureSettings || 'normal';
        }
      },
      'status': {
        get: function () {
          return this.loadStatus;
        }
      },
      'loaded': {
        get: function () {
          return this.promise;
        }
      }
    });

    if (typeof source === 'string') {
      this.urls = Src.parse(/** @type {string} */ (source));
    } else {
      this.buffer = /** @type {ArrayBuffer} */ (source);
      this.loadStatus = FontFaceLoadStatus.LOADED;
      this.resolveLoad(fontface);
    }
  };

  var FontFace = fl.FontFace;

  /**
   * @type {Element|null}
   */
  FontFace.STYLE_ELEMENT = null;

  /**
   * Inserts the FontFace in the document.
   */
  FontFace.prototype.insert = function () {
    if (!FontFace.STYLE_ELEMENT) {
      FontFace.STYLE_ELEMENT = dom.createElement('style');
      dom.append(document.head, FontFace.STYLE_ELEMENT);
    }

    var src = null;

    if (this.loadStatus === FontFaceLoadStatus.LOADED) {
      var bytes = new Uint8Array(this.buffer),
          tmp = '';

      for (var i = 0; i < bytes.length; i++) {
        tmp += String.fromCharCode(bytes[i]);
      }
      // TODO: Set the correct font format.
      src = 'url(data:font/opentype;base64,' + btoa(tmp) + ')';
    } else {
      src = this.source;
    }

    // This doesn't use font-stretch, font-variant or font-feature-settings
    // because support is hardly there and horribly broken.
    var css = '@font-face{' +
      'font-family:"' + this['family'] + '";' +
      'font-style:' + this['style'] + ';' +
      'font-weight:' + this['weight'] + ';' +
      'font-display:' + this['display'] + ';' +
    // TODO: unicode-range is fairly buggy in Chrome when it is used in combination
    // with characters that also have OpenType features. Disable it for now because
    // it's causing those characters not to render.
    //  'unicode-range:' + this['unicodeRange'] + ';' +
      'src:' + src + ';' +
    '}';

    FontFace.STYLE_ELEMENT.sheet.insertRule(css, 0);

    this.rule = FontFace.STYLE_ELEMENT.sheet.cssRules[0];
  };

  /**
   * Remove the FontFace from the document.
   */
  FontFace.prototype.remove = function () {
    if (FontFace.STYLE_ELEMENT && this.rule) {
      for (var i = 0; i < FontFace.STYLE_ELEMENT.sheet.cssRules.length; i++) {
        if (this.rule === FontFace.STYLE_ELEMENT.sheet.cssRules[i]) {
          FontFace.STYLE_ELEMENT.sheet.deleteRule(i);
          this.rule = null;
          break;
        }
      }
    }
  };

  /**
   * @private
   *
   * @param {Array.<string>} formats
   *
   * @return {string|null}
   */
  FontFace.prototype.getMatchingUrls = function (formats) {
    var url = null;

    // find matching format in urls
    for (var i = 0; i < formats.length; i++) {
      for (var j = 0; j < this.urls.length; j++) {
        if (formats[i] === this.urls[j].format && url === null) {
          url = this.urls[j].url;
          break;
        }
      }
    }

    // If there is no format but the browser supports at least
    // one format, just load the first one.
    if (!url && formats.length !== 0) {
      url = this.urls[0].url;
    }

    return url;
  };

  /**
   * @return {Promise.<fl.FontFace>}
   */
  FontFace.prototype.load = function () {
    var fontface = this;

    if (fontface.loadStatus === FontFaceLoadStatus.UNLOADED) {
      fontface.loadStatus = FontFaceLoadStatus.LOADING;

      FontFormat.detect().then(function (formats) {
        var url = fontface.getMatchingUrls(formats);

        if (url) {
          fetch(url).then(function (response) {
            if (response.ok) {
              return response.arrayBuffer();
            } else {
              throw response;
            }
          }).then(function (buffer) {
            fontface.buffer = buffer;
            fontface.loadStatus = FontFaceLoadStatus.LOADED;
            fontface.resolveLoad(fontface);
          }).catch(function (e) {
            fontface.loadStatus = FontFaceLoadStatus.ERROR;
            fontface.rejectLoad(fontface);
          });
        } else {
          fontface.loadStatus = FontFaceLoadStatus.ERROR;
          fontface.rejectLoad(fontface);
        }
      }).catch(function () {
        fontface.loadStatus = FontFaceLoadStatus.ERROR;
        fontface.rejectLoad(fontface);
      });
    }
    return this.promise;
  };
});
