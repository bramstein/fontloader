goog.provide('fontloader.css.UnicodeRange');

goog.require('fontloader.css.Range');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} input
   */
  fontloader.css.UnicodeRange = function (input) {
    /**
     * @type {Array.<fontloader.css.Range>}
     */
    this.ranges = [];

    var ranges = input.split(/\s*,\s*/),
        start = null,
        end = null;

    for (var i = 0; i < ranges.length; i++) {
      var match = /^(u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?)$/i.exec(ranges[i]);

      if (match) {
        if (match[2].indexOf('?') !== -1) {
          start = parseInt(match[2].replace('?', '0'), 16);
          end = parseInt(match[2].replace('?', 'f'), 16);
        } else {
          start = parseInt(match[2], 16);

          if (match[3]) {
            end = parseInt(match[3], 16);
          } else {
            end = start;
          }
        }

        this.ranges.push(new fontloader.css.Range(start, end));
      } else {
        throw new SyntaxError();
      }
    }
  };

  var UnicodeRange = fontloader.css.UnicodeRange;

  /**
   * @param {string} str
   * @return {fontloader.css.UnicodeRange}
   */
  UnicodeRange.parse = function (str) {
    var codePoints = [],
        tmp = {};

    for (var i = 0; i < str.length; i++) {
      var charCode = str.charCodeAt(i);

      if ((charCode & 0xF800) === 0xD800 && i < str.length) {
        var nextCharCode = str.charCodeAt(i + 1);
        if ((nextCharCode & 0xFC00) === 0xDC00) {
          tmp[((charCode & 0x3FF) << 10) + (nextCharCode & 0x3FF) + 0x10000] = true;
        } else {
          tmp[charCode] = true;
        }
        i++;
      } else {
        tmp[charCode] = true;
      }
    }

    for (var codePoint in tmp) {
      codePoints.push('u+' + parseInt(codePoint, 10).toString(16));
    }

    return new UnicodeRange(codePoints.join(','));
  };

  /**
   * @param {fontloader.css.UnicodeRange} other
   * @return {boolean} true if this UnicodeRange intersects with another
   */
  UnicodeRange.prototype.intersects = function (other) {
    for (var i = 0; i < this.ranges.length; i++) {
      for (var j = 0; j < other.ranges.length; j++) {
        if (this.ranges[i].intersects(other.ranges[j])) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * @private
   * @param {number} codePoint
   * @return {string}
   */
  UnicodeRange.prototype.encodeCodePoint = function (codePoint) {
    if (codePoint <= 0xffff) {
      return String.fromCharCode(codePoint);
    } else {
      return this.encodeCodePoint(Math.floor((codePoint - 0x10000) / 0x400) + 0xd800) +
             this.encodeCodePoint((codePoint - 0x10000) % 0x400 + 0xdc00);
    }
  };

  /**
   * @return {string}
   */
  UnicodeRange.prototype.toTestString = function () {
    var codePoints = [];

    if (this.ranges.length === 1 && this.ranges[0].start === 0x00 && this.ranges[0].end === 0x10ffff) {
      codePoints = [66, 69, 83, 98, 115, 119, 121];
    } else {
      for (var i = 0; i < this.ranges.length && codePoints.length < 7; i++) {
        var range = this.ranges[i];

        for (var j = range.start; j < range.end + 1 && codePoints.length < 7; j++) {
          // Ignore C0 and C1 control codes. This is no guarantee that the first
          // 10 characters in our unicode range are printable (and usable for font
          // load detection) but it is better than nothing.
          if (j > 0x20 && // C0 + space
              (j < 0x80 || j > 0x9f)) { // C1
            codePoints.push(j);
          }
        }
      }
    }

    var result = '';

    for (var l = 0; l < codePoints.length; l++) {
      result += this.encodeCodePoint(codePoints[l]);
    }

    return result;
  };

  /**
   * @return {string}
   */
  UnicodeRange.prototype.toString = function () {
    return this.ranges.join(',');
  };
});
