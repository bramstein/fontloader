goog.provide('fontloader.CssValue');

goog.require('fontloader.util');
goog.require('fontloader.UnicodeRange');
goog.require('fontloader.Url');


goog.scope(function () {

  /**
   * @typedef {Object.<string, (string|!Array.<string>)>}
   */
  fontloader.CssValue = {};

  var CssValue = fontloader.CssValue,
      util = fontloader.util,
      UnicodeRange = fontloader.UnicodeRange,
      Url = fontloader.Url;

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
          result = [],
          valid = false;

      while ((match = srcRegExp.exec(value))) {
        if (match[2]) {
          result.push(new Url(match[2], match[5]));
          valid = true;
        }
      }

      if (valid) {
        return result;
      } else {
        return null;
      }
    }
  };

  /**
   * @param {fontloader.CssValue} value
   * @param {boolean=} opt_important
   * @return {string}
   */
  CssValue.serialize = function (value, opt_important) {
    var result = [];

    for (var style in value) {
      if (value.hasOwnProperty(style)) {
        var property = style + ':';

        if (util.isArray(value[style])) {
          property += value[style].join(',');
        } else {
          property += value[style];
        }

        if (opt_important) {
          property += ' !important';
        }
        result.push(property);
      }
    }
    return result.join(';');
  };
});
