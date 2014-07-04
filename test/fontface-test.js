describe('FontFace', function () {
  var FontFace = fontloader.FontFace,
      FontFaceObserver = fontloader.FontFaceObserver,
      FontFaceLoadStatus = fontloader.FontFaceLoadStatus,
      Ruler = fontloader.Ruler;

  describe('#constructor', function () {
    it('throws when called without arguments', function () {
      expect(function () {
        new FontFace();
      }, 'to throw exception');
    });

    it('throws when called with less than three arguments', function () {
      expect(function () {
        new FontFace('My Family');
      }, 'to throw exception');
    });

    it('throws a syntax error if the source url is not a string or arraybuffer', function () {
      expect(function () {
        new FontFace('My Family', true, {});
      }, 'to throw exception');
    });

    it('accepts family names starting with non-valid identifier characters', function () {
      expect(new FontFace('3four', 'url(font.woff)', {}).family, 'to equal', '3four');
      expect(new FontFace('-5f', 'url(font.woff)', {}).family, 'to equal', '-5f');
      expect(new FontFace('--vendor', 'url(font.woff)', {}).family, 'to equal', '--vendor');
    });

    it('accepts randomly generated family names', function () {
      expect(new FontFace('32de8a5-2e72-4ade-dc76-ea7ad7c', 'url(font.woff)', {}).family, 'to equal', '32de8a5-2e72-4ade-dc76-ea7ad7c');
    });

    it('parses descriptors', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { style: 'italic' }).style, 'to equal', 'italic');
      expect(new FontFace('My Family', 'url(font.woff)', { weight: 'bold' }).weight, 'to equal', 'bold');
    });

    // This one is currently disabled because browsers do not yet accept font-stretch as part of the font shorthand
    // syntax. Fortunately, this also means the browser does not support font-stretch, so we can just ignore it for now.
    xit('parses descriptors with stretch', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { stretch: 'condensed' }).stretch, 'to equal', 'condensed');
    });

    // This one is currently disabled because Firefox does not support setting font-variant.
    xit('parses descriptors with variant', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { variant: 'small-caps' }).variant, 'to equal', 'small-caps');
    });

    it('defaults descriptors if not given', function () {
      var font = new FontFace('My Family', 'url(font.woff)', {});

      expect(font.style, 'to equal', 'normal');
      expect(font.weight, 'to equal', 'normal');
      expect(font.variant, 'to equal', 'normal');
    });

    it('accepts and uses an existing CSSRule', function () {
      var style = document.createElement('style');

      style.appendChild(document.createTextNode('@font-face{ font-family: "My Family"; src: url(unknown.woff); }'));
    });
  });

  describe('attributes', function () {
    it('updates the CSS rule when setting a FontFace attribute', function () {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      expect(font.weight, 'to equal', 'normal');

      font.weight = '500';

      expect(font.weight, 'to equal', '500');
      expect(font.cssRule.cssText, 'to match', /font-weight:\s*500/);

      font.weight = 'normal';
      expect(font.cssRule.cssText, 'to match', /font-weight:\s*normal/);
    });
  });

  describe('#load', function () {
    var startMethod = null;

    beforeEach(function () {
      startMethod = FontFaceObserver.prototype.start;
    });

    afterEach(function () {
      FontFaceObserver.prototype.start = startMethod;
    });

    it('resolves when a fake font loads', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return Promise.resolve(font);
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        done();
      });
    });

    it('resolves when a fake font loads with a delay', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(font);
          }, 50);
        });
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().then(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        done();
      });
    });

    it('rejects when a fake font fails to load', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return Promise.reject(font);
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().catch(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.ERROR);
        done();
      });
    });

    it('rejects when a fake font fails to load with a delay', function (done) {
      var font = new FontFace('My Family', 'url(unknown.woff)', {});

      FontFaceObserver.prototype.start = function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(font);
          }, 50);
        });
      };

      expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

      font.load().catch(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', FontFaceLoadStatus.ERROR);
        done();
      });
    });

    if (window['ArrayBuffer']) {
      it('loads immediately when given a fake arraybuffer', function (done) {
        FontFaceObserver.prototype.start = function () {
          return Promise.resolve('font');
        };

        var font = new FontFace('My Family', new ArrayBuffer(4), {});

        expect(font.status, 'to equal', FontFaceLoadStatus.UNLOADED);

        font.load().then(function (f) {
          expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
          expect(f, 'to equal', font);
          done();
        }, function (r) {
          done(r);
        });
      });
    }

    it('loads a font and resolves correctly but does not make the font available by its family name', function (done) {
      var font = new FontFace('fontface-test1', 'url(assets/sourcesanspro-regular.woff)', {}),
          ruler = new Ruler('hello world'),
          before = -1;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();

      ruler.setStyle('font-family: fontface-test1, monospace');
      font.load().then(function (f) {
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        expect(ruler.getWidth(), 'to equal', before);
        done();
      }).catch(function (e) {
        done(e);
      });
    });

    it('loads a font and resolves correctly and the font is available by its internal name', function (done) {
      var font = new FontFace('fontface-test2', 'url(assets/sourcesanspro-regular.woff)', {}),
          ruler = new Ruler('hello world'),
          before = -1;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();

      ruler.setStyle('font-family: \'' + font.internalFamily + '\', monospace');
      font.load().then(function (f) {
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        expect(ruler.getWidth(), 'not to equal', before);
        done();
      }).catch(function (e) {
        done(e);
      });
    });

    it('loads a font and resolves correctly and makes the font available when connected', function (done) {
      var font = new FontFace('fontface-test3', 'url(assets/sourcesanspro-regular.woff)', {}),
          ruler = new Ruler('hello world'),
          before = -1;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();

      ruler.setStyle('font-family: fontface-test3, monospace');
      font.load().then(function (f) {
        expect(font.status, 'to equal', FontFaceLoadStatus.LOADED);
        expect(ruler.getWidth(), 'to equal', before);
        font.connect().then(function (f) {
          expect(ruler.getWidth(), 'not to equal', before);
          done();
        }, function (r) {
          done(r);
        });
      }, function (r) {
        done(r);
      });
    });
  });
});
