goog.provide('fontloader.UnicodeRange');

goog.require('fontloader.Range');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} input
   */
  fontloader.UnicodeRange = function (input) {
    /**
     * @type {Array.<fontloader.Range>}
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

        this.ranges.push(new fontloader.Range(start, end));
      } else {
        throw new SyntaxError();
      }
    }
  };

  var UnicodeRange = fontloader.UnicodeRange;

  /**
   * @param {string} str
   * @return {fontloader.UnicodeRange}
   */
  UnicodeRange.parse = function (str) {
    var codePoints = [],
        tmp = {};

    for (var i = 0; i < str.length; i++) {
      var codePoint = str.charCodeAt(i);

      if ((codePoint & 0xF800) === 0xD800 && i < str.length) {
        var nextCodePoint = str.charCodeAt(i + 1);
        if ((nextCodePoint & 0xFC00) === 0xDC00) {
          tmp[((codePoint & 0x3FF) << 10) + (nextCodePoint & 0x3FF) + 0x10000] = true;
        } else {
          tmp[codePoint] = true;
        }
        i++;
      } else {
        tmp[codePoint] = true;
      }
    }

    for (var codePoint in tmp) {
      codePoints.push('u+' + parseInt(codePoint, 10).toString(16));
    }

    return new UnicodeRange(codePoints.join(','));
  };

  /**
   * @private
   * @param {number} codePoint
   * @return {string}
   */
  UnicodeRange.prototype.encodeCodePoint = function (codePoint) {
    if (codePoint >= 0x21 && codePoint <= 0x7e) {
      return String.fromCharCode(codePoint);
    } else if (codePoint <= 0xffff) {
      return '\\u' + (codePoint + 0x10000).toString(16).substr(-4);
    } else {
      return this.encodeCodePoint(Math.floor((codePoint - 0x10000) / 0x400) + 0xd800) +
             this.encodeCodePoint((codePoint - 0x10000) % 0x400 + 0xdc00);
    }
  };

  /**
   * @return {string}
   */
  UnicodeRange.prototype.toTestString = function () {
    var codePoints = [],
        defaultCodePoints = [66, 69, 83, 98, 115, 119, 121];

    if (this.ranges.length === 1 && this.ranges[0].start === 0x00 && this.ranges[0].end === 0x10ffff) {
      codePoints = defaultCodePoints;
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

      // This should only happen when the given unicode range consists
      // only of control characters. Give up and use the default string.
      if (codePoints.length === 0) {
        codePoints = defaultCodePoints;
      }
    }

    var result = '';

    for (var i = 0; i < codePoints.length; i++) {
      result += this.encodeCodePoint(codePoints[i]);
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
