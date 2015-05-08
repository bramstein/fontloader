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
   * Width is 1024 (1em).
   * @const
   * @type {string}
   */
  FontFormat.OPENTYPE = 'AAEAAAAKAIAAAwAgT1MvMgSEBCEAAAEoAAAATmNtYXAADABzAAABgAAAACxnbHlmCAE5AgAAAbQAAAAUaGVhZARxAiIAAACsAAAANmhoZWEIAQQDAAAA5AAAACRobXR4BAAAAAAAAXgAAAAIbG9jYQAKAAAAAAGsAAAABm1heHAABAACAAABCAAAACBuYW1lACMIXgAAAcgAAAAgcG9zdAADAAAAAAHoAAAAIAABAAAAAQAAayoF118PPPUAAgQAAAAAANBme+sAAAAA0PVBQgAAAAAEAAQAAAAAAAACAAAAAAAAAAEAAAQAAAAAAAQAAAAAAAQAAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAIAQAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAQADAAEAAAAMAAQAIAAAAAQABAABAAAAQP//AAAAQP///8EAAQAAAAAAAAAAAAoAAAABAAAAAAQABAAAAQAAMQEEAAQAAAAAAgAeAAMAAQQJAAEAAgAAAAMAAQQJAAIAAgAAAEAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

  /**
   * @type {Promise.<!Array.<string>>}
   */
  FontFormat.SUPPORTED_FORMATS = null;

  /**
   * @return {Promise.<!Array.<string>>}
   */
  FontFormat.detect = function () {
    if (!FontFormat.SUPPORTED_FORMATS) {
      var style = document.createElement('style'),
          head = document.getElementsByTagName('head')[0];

      style.appendChild(document.createTextNode(
        '@font-face{' +
          'font-family:"__fff__";' +
          'src:' +
            'url(data:font/font-woff2;base64,' + FontFormat.WOFF2  +') format("woff2"),' +
            'url(data:application/font-woff;base64,' + FontFormat.WOFF + ') format("woff"),' +
            'url(data:font/opentype;base64,' + FontFormat.OPENTYPE + ') format("opentype");' +
        '}'
      ));

      head.appendChild(style);

      FontFormat.SUPPORTED_FORMATS = new fontface.Observer('__fff__', {}).check('@').then(function () {
        var ruler = new fontface.Ruler('@'),
            formats = [];

        ruler.setFont('__fff__', '');

        document.body.appendChild(ruler.getElement());

        var width = ruler.getWidth();

        if (width === 300) {
          formats = ['woff2', 'woff', 'opentype', 'truetype'];
        } else if (width === 200) {
          formats = ['woff', 'opentype', 'truetype'];
        } else if (width === 100) {
          formats = ['opentype', 'truetype'];
        }

        head.removeChild(style);
        document.body.removeChild(ruler.getElement());

        return formats;
      });
    }
    return FontFormat.SUPPORTED_FORMATS;
  };
});
