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
      return new UnicodeRange(value);
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
   * @private
   * @enum {number}
   */
  CssValue.ParserState = {
    VARIATION: 1,
    LINE_HEIGHT: 2,
    FONT_FAMILY: 3,
    BEFORE_FONT_FAMILY: 4
  };

  /**
   * @param {string} str
   * @return {fontloader.CssValue}
   */
  CssValue.parse = function (str) {
    var state = CssValue.ParserState.VARIATION,
        buffer = '',
        result = {
          'font-family': []
        };

    for (var c, i = 0; c = str.charAt(i); i += 1) {
      if (state === CssValue.ParserState.BEFORE_FONT_FAMILY && (c === '"' || c === "'")) {
        var index = i + 1;

        // consume the entire string
        do {
          index = str.indexOf(c, index) + 1;
          if (!index) {
            // If a string is not closed by a ' or " return null.
            return null;
          }
        } while (str.charAt(index - 2) === '\\');

        result['font-family'].push(str.slice(i, index));

        i = index - 1;
        state = CssValue.ParserState.FONT_FAMILY;
        buffer = '';
      } else if (state === CssValue.ParserState.FONT_FAMILY && c === ',') {
        state = CssValue.ParserState.BEFORE_FONT_FAMILY;
        buffer = '';
      } else if (state === CssValue.ParserState.BEFORE_FONT_FAMILY && c === ',') {
        var identifier = CssValue.Parsers.FAMILY(buffer);

        if (identifier) {
          result['font-family'].push(identifier);
        }
        buffer = '';
      } else if (state === CssValue.ParserState.VARIATION && (c === ' ' || c === '/')) {
        if (/^((xx|x)-large|(xx|s)-small|small|large|medium)$/.test(buffer) ||
            /^(larg|small)er$/.test(buffer) ||
            /^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)$/.test(buffer)) {
          if (c === '/') {
            state = CssValue.ParserState.LINE_HEIGHT;
          } else {
            state = CssValue.ParserState.BEFORE_FONT_FAMILY;
          }
          result['font-size'] = buffer;
        } else if (CssValue.Parsers.STYLE(buffer)) {
          result['font-style'] = buffer;
        } else if (CssValue.Parsers.VARIANT(buffer)) {
          result['font-variant'] = buffer;
        } else if (CssValue.Parsers.WEIGHT(buffer)) {
          result['font-weight'] = buffer;
        } else if (CssValue.Parsers.STRETCH(buffer)) {
          result['font-stretch'] = buffer;
        }
        buffer = '';
      } else if (state === CssValue.ParserState.LINE_HEIGHT && c === ' ') {
        if (/^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)?$/.test(buffer)) {
          result['line-height'] = buffer;
        }
        state = CssValue.ParserState.BEFORE_FONT_FAMILY;
        buffer = '';
      } else {
        buffer += c;
      }
    }

    // This is for the case where a string was specified followed by
    // an identifier, but without a separating comma.
    if (state === CssValue.ParserState.FONT_FAMILY && !/^\s*$/.test(buffer)) {
      return null;
    }

    if (state === CssValue.ParserState.BEFORE_FONT_FAMILY) {
      var identifier = CssValue.Parsers.FAMILY(buffer);

      if (identifier) {
        result['font-family'].push(identifier);
      }
    }

    if (result['font-size'] && result['font-family'].length) {
      return result;
    } else {
      return null;
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
