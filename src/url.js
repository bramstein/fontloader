goog.provide('fontloader.Url');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} url
   * @param {string=} opt_format
   */
  fontloader.Url = function (url, opt_format) {
    this.url = url;
    this.format = opt_format || null;
  };

  var Url = fontloader.Url;

  Url.prototype.toString = function () {
    var result = 'url(' + encodeURIComponent(this.url) + ')';
    if (this.format) {
      result += ' format(' + this.format + ')';
    }
    return result;
  };
});
