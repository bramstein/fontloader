goog.provide('fontloader.CssValue');

goog.require('fontloader.UnicodeRange');

goog.scope(function () {
  fontloader.CssValue = {};

  var CssValue = fontloader.CssValue,
      UnicodeRange = fontloader.UnicodeRange;

  /**
   * @enum {function(string):*}
   */
  CssValue.Parsers = {
    FAMILY: function (value) {
      if (value) {
        var identifiers = value.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ').split(' ');

        for (var i = 0; i < identifiers.length; i += 1) {
          if (/^(-?\d|--)/.test(identifiers[i]) ||
              !/^([_a-zA-Z0-9-]|[^\0-\237]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f]))+$/.test(identifiers[i])) {
            return null;
          }
        }
        return identifiers.join(' ');
      } else {
        return null;
      }
    },
    STYLE: function (value) {
      return /^(italic|oblique|normal)$/.test(value) && value || null;
    },
    WEIGHT: function (value) {
      return /^(bold(er)?|lighter|[1-9]00|normal)$/.test(value) && value || null;
    },
    STRETCH: function (value) {
      return /^(((ultra|extra|semi)-)?(condensed|expanded)|normal)$/.test(value) && value || null;
    },
    UNICODE_RANGE: function (value) {
      var ranges = value.split(/\s*,\s*/),
          result = [];

      for (var i = 0; i < ranges.length; i++) {
        result.push(new UnicodeRange(ranges[i]));
      }

      return result;
    },
    VARIANT: function (value) {
      return /^(small-caps|normal)$/.test(value) && value || null;
    },
    FEATURE_SETTINGS: function (value) {
      return /^normal$/.test(value) && value || null;
    },
    SRC: function (value) {
      var srcRegExp = /\burl\((\'|\"|)([^\'\"]+?)\1\)( format\((\'|\"|)([^\'\"]+?)\4\))?/g,
          match = null,
          valid = false;

      while ((match = srcRegExp.exec(value))) {
        if (match[2]) {
          valid = true;
        }
      }

      if (valid) {
        return value;
      } else {
        return null;
      }
    }
  };
});
