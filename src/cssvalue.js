goog.provide('fontloader.CSSValue');

goog.scope(function () {
  fontloader.CSSValue = {};

  var CSSValue = fontloader.CSSValue;

  /**
   * @param {string} input
   * @return {Object.<string,(string|Array.<string>)>}
   */
  CSSValue.parseFont = function (input) {
    var element = document.createElement('span'),
        result = {};

    element.style.cssText = 'font:' + input;

    if (!element.style.fontFamily) {
      throw new SyntaxError('Font syntax is invalid: ' + input);
    } else {
      var weight = element.style.fontWeight || 'normal';

      if (weight === 'normal') {
        weight = '400';
      } else if (weight === 'bold') {
        weight = '700';
      }

      return {
        style: element.style.fontStyle || 'normal',
        variant: element.style.fontVariant || 'normal',
        weight: weight,
        stretch: element.style.fontStretch || 'normal',
        family: CSSValue.parseFamily(element.style.fontFamily)
      };
    }
  };

  /**
   * @param {string} input
   * @return {Array.<string>}
   */
  CSSValue.parseFamily = function (input) {
    var buffer = '',
        result = [];

    for (var i = 0; i < input.length; i++) {
      var c = input.charAt(i);

      if (c === "'" || c === '"') {
        var index = i + 1;

        do {
          index = input.indexOf(c, index) + 1;

          if (!index) {
            throw new SyntaxError('Unclosed quote');
          }
        } while (input.charAt(index - 2) === '\\');

        result.push(input.slice(i + 1, index - 1));

        i = index - 1;
        buffer = '';
      } else if (c === ',') {
        buffer = buffer.trim()
        if (buffer !== '') {
          result.push(buffer);
          buffer = '';
        }
      } else {
        buffer += c;
      }
    }

    buffer = buffer.trim();
    if (buffer !== '') {
      result.push(buffer);
    }

    return result;
  };
});
