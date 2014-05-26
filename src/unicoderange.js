goog.provide('fontloader.UnicodeRange');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} range
   */
  fontloader.UnicodeRange = function (range) {
    /**
     * @type {number}
     */
    this.start;

    /**
     * @type {number}
     */
    this.end;


    var match = /^(u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?)$/i.exec(range);

    if (match) {
      var start = match[2],
          end = match[3];

      if (start.indexOf('?') !== -1) {
        this.start = parseInt(start.replace('?', '0'), 16);
        this.end = parseInt(start.replace('?', 'f'), 16);
      } else {
        this.start = parseInt(start, 16);

        if (end) {
          this.end = parseInt(end, 16);
        } else {
          this.end = this.start;
        }
      }
    } else {
      throw new SyntaxError();
    }
  };

  var UnicodeRange = fontloader.UnicodeRange;

  /**
   * @param {number} codePoint
   * @return {boolean}
   */
  UnicodeRange.prototype.contains = function (codePoint) {
    return codePoint >= this.start && codePoint <= this.end;
  };

  /**
   * @return {string}
   */
  UnicodeRange.prototype.toString = function () {
    if (this.start === this.end) {
      return 'u+' + this.start.toString(16);
    } else {
      return 'u+' + this.start.toString(16) + '-' + this.end.toString(16);
    }
  };
});
