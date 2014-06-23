goog.provide('fontloader.css.Range');

goog.scope(function () {
  /**
   * @constructor
   * @param {number} start
   * @param {number} end
   */
  fontloader.css.Range = function (start, end) {
    /**
     * @type {number}
     */
    this.start = start;

    /**
     * @type {number}
     */
    this.end = end;
  };

  var Range = fontloader.css.Range;

  /**
   * @param {number} codePoint
   * @return {boolean}
   */
  Range.prototype.contains = function (codePoint) {
    return codePoint >= this.start && codePoint <= this.end;
  };

  /**
   * @param {fontloader.css.Range} other
   * @return {boolean} true if this Range intersects other.
   */
  Range.prototype.intersects = function (other) {
    return this.start <= other.end && this.end >= other.start;
  };

  /**
   * @return {string}
   */
  Range.prototype.toString = function () {
    if (this.start === this.end) {
      return 'u+' + this.start.toString(16);
    } else {
      return 'u+' + this.start.toString(16) + '-' + this.end.toString(16);
    }
  };
});
