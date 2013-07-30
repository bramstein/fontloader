goog.provide('fontloader.CSSValue');

goog.require('fontloader.util');

goog.scope(function () {
  /**
   * @typedef {Object.<string, (string|!Array.<string>)>}
   */
  fontloader.CSSValue = {};

  var CSSValue = fontloader.CSSValue,
      util = fontloader.util;

  /**
   * @param {fontloader.CSSValue} value
   * @param {boolean=} opt_important
   * @return {string}
   */
  CSSValue.serialize = function (value, opt_important) {
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

  /**
   * @enum {number}
   */
  CSSValue.ParserState = {
    VARIATION: 1,
    LINE_HEIGHT: 2,
    FONT_FAMILY: 3,
    BEFORE_FONT_FAMILY: 4
  };

  /**
   * Parses a CSSValue and returns a dict of key values.
   *
   * Note: this currently only parses CSS font values. Not sure
   * if it is worth extending it to support other values.
   *
   * @param {string} str
   * @return {fontloader.CSSValue|null} A CSSValue dict if the parse is successful, null otherwise.
   */
  CSSValue.parse = function (str) {
    var state = CSSValue.ParserState.VARIATION,
        buffer = '',
        result = {
          'font-family': []
        };

    for (var c, i = 0; c = str.charAt(i); i += 1) {
      if (state === CSSValue.ParserState.BEFORE_FONT_FAMILY && (c === '"' || c === "'")) {
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
        state = CSSValue.ParserState.FONT_FAMILY;
        buffer = '';
      } else if (state === CSSValue.ParserState.FONT_FAMILY && c === ',') {
        state = CSSValue.ParserState.BEFORE_FONT_FAMILY;
        buffer = '';
      } else if (state === CSSValue.ParserState.BEFORE_FONT_FAMILY && c === ',') {
        var identifier = CSSValue.parseIdentifier(buffer);

        if (identifier) {
          result['font-family'].push(identifier);
        }
        buffer = '';
      } else if (state === CSSValue.ParserState.VARIATION && (c === ' ' || c === '/')) {
        if (/^((xx|x)-large|(xx|s)-small|small|large|medium)$/.test(buffer) ||
            /^(larg|small)er$/.test(buffer) ||
            /^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)$/.test(buffer)) {
          if (c === '/') {
            state = CSSValue.ParserState.LINE_HEIGHT;
          } else {
            state = CSSValue.ParserState.BEFORE_FONT_FAMILY;
          }
          result['font-size'] = buffer;
        } else if (/^(italic|oblique)$/.test(buffer)) {
          result['font-style'] = buffer;
        } else if (/^small-caps$/.test(buffer)) {
          result['font-variant'] = buffer;
        } else if (/^(bold(er)?|lighter|[1-9]00)$/.test(buffer)) {
          result['font-weight'] = buffer;
        } else if (/^((ultra|extra|semi)-)?(condensed|expanded)$/.test(buffer)) {
          result['font-stretch'] = buffer;
        }
        buffer = '';
      } else if (state === CSSValue.ParserState.LINE_HEIGHT && c === ' ') {
        if (/^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)?$/.test(buffer)) {
          result['line-height'] = buffer;
        }
        state = CSSValue.ParserState.BEFORE_FONT_FAMILY;
        buffer = '';
      } else {
        buffer += c;
      }
    }

    // This is for the case where a string was specified followed by
    // an identifier, but without a separating comma.
    if (state === CSSValue.ParserState.FONT_FAMILY && !/^\s*$/.test(buffer)) {
      return null;
    }

    if (state === CSSValue.ParserState.BEFORE_FONT_FAMILY) {
      var identifier = CSSValue.parseIdentifier(buffer);

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
   * Attempt to parse a string as an identifier. Return
   * a normalized identifier, or null when the string
   * contains an invalid identifier.
   *
   * @param {string} str
   * @return {string|null}
   */
  CSSValue.parseIdentifier = function (str) {
    var identifiers = str.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ').split(' ');

    for (var i = 0; i < identifiers.length; i += 1) {
      if (/^(-?\d|--)/.test(identifiers[i]) ||
           !/^([_a-zA-Z0-9-]|[^\0-\237]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f]))+$/.test(identifiers[i])) {
        return null;
      }
    }
    return identifiers.join(' ');
  };
});
