goog.provide('fl.FontFace');

goog.require('fl.FontFaceLoadStatus');
goog.require('fl.FontFormat');

goog.require('cssvalue.Src');

goog.require('dom');

goog.scope(function () {
  var FontFaceLoadStatus = fl.FontFaceLoadStatus,
      FontFormat = fl.FontFormat,
      Src = cssvalue.Src;

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

    /**
     * @type {Element}
     */
    this.element = null;
  };

  var FontFace = fl.FontFace;

  /**
   * Inserts the FontFace in the document.
   */
  FontFace.prototype.insert = function () {
    if (!this.element) {
      var src = null;

      if (this.loadStatus === FontFaceLoadStatus.LOADED) {
        var bytes = new Uint8Array(this.buffer),
            tmp = '';

        for (var i = 0; i < bytes.length; i++) {
          tmp += String.fromCharCode(bytes[i]);
        }
        src = 'url(data:font/opentype;base64,' + btoa(tmp) + ')';
      } else {
        src = this.source;
      }

      // This doesn't use font-stretch, font-variant or font-feature-settings
      // because support is hardly there and horribly broken.
      var css = '@font-face {' +
        'font-family:"' + this['family'] + '";' +
        'src:' + src + ';' +
        'font-style:' + this['style'] + ';' +
        'font-weight:' + this['weight'] + ';' +
        'unicode-range:' + this['unicodeRange'] + ';' +
      '}';

      this.element = dom.createElement('style');
      this.element.textContent = css;
      dom.append(document.head, this.element);
    }
  };

  /**
   * Remove the FontFace from the document.
   */
  FontFace.prototype.remove = function () {
    if (this.element) {
      dom.remove(this.element.parentNode, this.element);
      this.element = null;
    }
  };


  /**
   * @return {Promise.<fl.FontFace>}
   */
  FontFace.prototype.load = function () {
    var fontface = this;

    if (fontface.loadStatus === FontFaceLoadStatus.UNLOADED) {
      fontface.loadStatus = FontFaceLoadStatus.LOADING;

      FontFormat.detect().then(function (formats) {
        var url = null;

        // find matching format in urls
        for (var i = 0; i < formats.length; i++) {
          for (var j = 0; j < fontface.urls.length; j++) {
            if (formats[i] === fontface.urls[j].format) {
              url = fontface.urls[j].url;
              break;
            }
          }
        }

        // If there is no format but the browser supports at least
        // one format, just load the first one.
        if (!url && formats.length !== 0) {
          url = fontface.urls[0].url;
        }

        if (url) {
          fetch(url).then(function (response) {
            return response.arrayBuffer();
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
      });
    }
    return this.promise;
  };
});
