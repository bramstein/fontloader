goog.provide('fontloader.css.Url');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} url
   * @param {string=} opt_format
   */
  fontloader.css.Url = function (url, opt_format) {
    this.url = url;
    this.format = opt_format || null;
  };

  var Url = fontloader.css.Url;

  Url.prototype.toString = function () {
    var result = 'url(' + encodeURI(this.url) + ')';
    if (this.format) {
      result += ' format(\'' + this.format + '\')';
    }
    return result;
  };
});
