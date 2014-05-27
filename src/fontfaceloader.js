goog.provide('fontloader.FontFaceLoader');

goog.require('fontloader.Ruler');

goog.scope(function () {
  var Ruler = fontloader.Ruler;

  /**
   * @constructor
   * @param {fontloader.FontFace} font
   */
  fontloader.FontFaceLoader = function (font) {
    this.font = font;
  };

  var FontFaceLoader = fontloader.FontFaceLoader;

  /**
   * @return {Promise}
   */
  FontFaceLoader.prototype.load = function () {
    var css = this.font.toCss();

    return new Promise(function (resolve, reject) {
      var head = document.head || document.getElementsByTagName('head')[0];

      if (head) {
        var styleElement = document.createElement('style');

        styleElement.setAttribute('type', 'text/css');

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = css;
        } else {
          styleElement.appendChild(document.createTextNode(css));
        }

        head.appendChild(styleElement);


      } else {
        reject(new SyntaxError("Could not find 'head' element in document."));
      }
    });
  };
});
