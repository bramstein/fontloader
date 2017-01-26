goog.provide('fl.FontFormat');

goog.require('fontface.Observer');

goog.scope(function () {
  fl.FontFormat = {};

  var FontFormat = fl.FontFormat;

  /**
   * Width is 3072 (3em).
   *
   * @const
   * @type {string}
   */
  FontFormat.WOFF2 = 'd09GMgABAAAAAADcAAoAAAAAAggAAACWAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABk4ALAoUNAE2AiQDCAsGAAQgBSAHIBtvAciuMTaGVo8IaqBbcKPeB3CyAAIO4unr9nb72QE3p00iGQQIZcAAcAMEJOztBx7zdWVWn//BAPW1l0BN429cPrCPE75MA637gPs0DjavNxzHtWeXXErKIV3AF9TbHqCTOATL2BgjeIH30lQwSAonU1LabV8Iz12wDvgd/obV5QVxXDKvUhW1QfWNrS6HzEQJaP4tBA==';

  /**
   * Width is 2048 (2em).
   *
   * @const
   * @type {string}
   */
  FontFormat.WOFF = 'd09GRgABAAAAAAHgAAoAAAAAAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABUAAAABcAAABOBIQEIWNtYXAAAAFwAAAAJgAAACwADABzZ2x5ZgAAAaAAAAAUAAAAFAwBPQJoZWFkAAAA9AAAAC0AAAA2CHEB92hoZWEAAAEkAAAAFgAAACQMAQgDaG10eAAAAWgAAAAIAAAACAgAAABsb2NhAAABmAAAAAYAAAAGAAoAAG1heHAAAAE8AAAAEwAAACAABAACbmFtZQAAAbQAAAAeAAAAIAAjCF5wb3N0AAAB1AAAAAwAAAAgAAMAAHgBY2BkYABhb81vuvH8Nl8ZmFgYQOBCWvVrMP3VURxEczBAxBmYQAQAAFIIBgAAAHgBY2BkYGBhAAEOKAkUQQVMAAJKABkAAHgBY2BkYGBgAkIgjQ0AAAC+AAcAeAFjAIEUBkYGcoECgwILmAEiASBRAK4AAAAAAAgAAAB4AWNgYGBkYAZiBgYeBhYGBSDNAoQgvsP//xDy/0EwnwEATX4GfAAAAAAAAAAKAAAAAQAAAAAIAAQAAAEAADEBCAAEAHgBY2BgYGKQY2BmYGThZGAEshmgbCYw2wEABjMAigAAeAFjYGbACwAAfQAE';

  /**
   * @type {string}
   */
  FontFormat.TEST_FONT_FAMILY = '_fff_';

  /**
   * @type {Promise.<!Array.<string>>}
   */
  FontFormat.SUPPORTED_FORMATS = null;

  /**
   * @return {Promise.<!Array.<string>>}
   */
  FontFormat.detect = function () {
    if (!FontFormat.SUPPORTED_FORMATS) {
      if (/MSIE|Trident/.test(navigator.userAgent)) {
        return Promise.resolve(['woff', 'opentype', 'truetype']);
      }

      var style = document.createElement('style'),
          head = document.getElementsByTagName('head')[0];

      style.appendChild(document.createTextNode(
        '@font-face{' +
          'font-family:"' + FontFormat.TEST_FONT_FAMILY + '";' +
          'src:' +
            'url(data:font/woff2;base64,' + FontFormat.WOFF2  +') format("woff2"),' +
            'url(data:application/font-woff;base64,' + FontFormat.WOFF + ') format("woff")' +
        '}'
      ));

      head.appendChild(style);

      // TODO: Since we have the font data hardcoded in the JS we can
      // use the forced-relayout trick here, which removes the need
      // to insert test spans into the document.
      FontFormat.SUPPORTED_FORMATS = new fontface.Observer(FontFormat.TEST_FONT_FAMILY, {}).load('@', 5000).then(function () {
        var ruler = new fontface.Ruler('@'),
            formats = ['opentype', 'truetype'];

        ruler.setFont(FontFormat.TEST_FONT_FAMILY);

        document.body.appendChild(ruler.getElement());

        var width = ruler.getWidth();

        if (width >= 200) {
          formats.unshift('woff');
        }

        if (width == 300) {
          formats.unshift('woff2');
        }

        head.removeChild(style);
        document.body.removeChild(ruler.getElement());

        return formats;
      }, function () {
        return ['opentype', 'truetype'];
      });
    }
    return FontFormat.SUPPORTED_FORMATS;
  };
});
