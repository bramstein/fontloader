goog.provide('fl.CSSValue');

goog.scope(function () {
  // TODO: Move CSSValue to its own repository as it is useful beyond the fontloader.
  fl.CSSValue = {};

  var CSSValue = fl.CSSValue;

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
      return {
        style: element.style.fontStyle || 'normal',
        variant: element.style.fontVariant || 'normal',
        weight: element.style.fontWeight || 'normal',
        stretch: element.style.fontStretch || 'normal',
        family: CSSValue.parseFamily(element.style.fontFamily)
      };
    }
  };

  /**
   * @param {string} input
   *
   * @return {Array.<fl.FontFaceSource>}
   */
  CSSValue.parseSrc = function (input) {
    var srcRegExp = /\burl\((\'|\"|)([^\'\"]+?)\1\)( format\((\'|\"|)([^\'\"]+?)\4\))?/g,
        match = null,
        result = [];

    while ((match = srcRegExp.exec(input))) {
      if (match[2]) {
        result.push({
          url: match[2],
          format: match[5]
        });
      }
    }
    return result;
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
