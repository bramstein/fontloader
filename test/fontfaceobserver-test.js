describe('FontFaceObserver', function () {
  var FontFaceObserver = fontloader.FontFaceObserver,
      FontFace = fontloader.FontFace,
      Ruler = fontloader.Ruler;

  describe('#constructor', function () {
    it('should accept a FontFace instance an initialise the font cache', function () {
      var font = new FontFace('Test', 'url(unknown.woff)', {}),
          loader = new FontFaceObserver(font);

      expect(loader.cache, 'not to equal', undefined);
      expect(loader.cache.sansserif, 'not to equal', 0);
      expect(loader.cache.serif, 'not to equal', 0);
      expect(loader.cache.monospace, 'not to equal', 0);
    });
  });

  describe('#isFallbackFont', function () {
    var font = null,
        loader = null;

    beforeEach(function () {
      font = new FontFace('Test', 'url(unknown.woff)', {});
      loader = new FontFaceObserver(font);

      loader.cache = {
        sansserif: 10,
        serif: 12,
        monospace: 15
      };
    });

    it('returns true when the widths match the fallback fonts', function () {
      expect(loader.isFallbackFont(10, 12), 'to be true');
    });

    it('returns false when one or two of the widths do not match the fallback fonts', function () {
      expect(loader.isFallbackFont(10, 13), 'to be false');
      expect(loader.isFallbackFont(11, 13), 'to be false');
    });
  });

  describe('#isLastResortFont', function () {
    var font = null,
        loader = null;

    beforeEach(function () {
      font = new FontFace('Test', 'url(unknown.woff)', {});
      loader = new FontFaceObserver(font);

      loader.cache = {
        sansserif: 10,
        serif: 12,
        monospace: 15
      };

      FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG = true;
    });

    it('returns false when the WebKit fallback bug is not present even if it matches a last resort font', function () {
      FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG = false;

      expect(loader.isLastResortFont(10, 10), 'to be false');
      expect(loader.isLastResortFont(12, 12), 'to be false');
      expect(loader.isLastResortFont(15, 15), 'to be false');
    });

    it('returns true if it matches one of the last resort fonts', function () {
      expect(loader.isLastResortFont(10, 10), 'to be true');
      expect(loader.isLastResortFont(12, 12), 'to be true');
      expect(loader.isLastResortFont(15, 15), 'to be true');
    });

    it('returns false if it does not match any of the last resort fonts', function () {
      expect(loader.isLastResortFont(10, 11), 'to be false');
      expect(loader.isLastResortFont(13, 13), 'to be false');
    });
  });

  describe('#hasWebKitFallbackBug', function () {
    var font = null,
        loader = null,
        getUserAgent = null;

    beforeEach(function () {
      font = new FontFace('Test', 'url(unknown.woff)', {});
      loader = new FontFaceObserver(font);

      FontFaceObserver.HAS_WEBKIT_FALLBACK_BUG = null;

      getUserAgent = sinon.stub(loader, 'getUserAgent');
    });

    afterEach(function () {
      getUserAgent.restore();
    });

    it('returns false when the user agent is not WebKit', function () {
      getUserAgent.returns('Mozilla/5.0 (Android; Mobile; rv:13.0) Gecko/15.0 Firefox/14.0');

      expect(loader.hasWebKitFallbackBug(), 'to be false');
    });

    it('returns false when the user agent is WebKit but the bug is not present', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.12 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/536.12');

      expect(loader.hasWebKitFallbackBug(), 'to be false');
    });

    it('returns true when the user agent is WebKit and the bug is present', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/536.11');

      expect(loader.hasWebKitFallbackBug(), 'to be true');
    });

    it('returns true when the user agent is WebKit and the bug is present in an old version', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/535.19');

      expect(loader.hasWebKitFallbackBug(), 'to be true');
    });

    it('caches the results', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/536.11');

      expect(loader.hasWebKitFallbackBug(), 'to be true');

      getUserAgent.returns('Mozilla/5.0 (Android; Mobile; rv:13.0) Gecko/15.0 Firefox/14.0');

      expect(loader.hasWebKitFallbackBug(), 'to be true');
    });
  });

  describe('#start', function () {
    var defaultTimeout = null;

    beforeEach(function () {
      defaultTimeout = FontFaceObserver.DEFAULT_TIMEOUT;
    });

    afterEach(function () {
      FontFaceObserver.DEFAULT_TIMEOUT = defaultTimeout;
    });

    it('should load a font and resolve the promise', function (done) {
      var font = new FontFace(
            'test1',
            'url("assets/sourcesanspro-regular.eot?#iefix") format(\'embedded-opentype\'),' +
            'url("assets/sourcesanspro-regular.woff") format(\'woff\')',
            {}
          ),
          ruler = new Ruler('hello world'),
          before = -1;

      FontFaceObserver.DEFAULT_TIMEOUT = 200;

      ruler.insert();
      ruler.setStyle('font-family:monospace');

      before = ruler.getWidth();
      ruler.setStyle(font.getStyle());
      font.load().then(function (x) {
        var active = ruler.getWidth();
        expect(active, 'not to equal', before);
        setTimeout(function () {
          var after = ruler.getWidth();
          expect(after, 'to equal', active);
          expect(after, 'not to equal', before);
          ruler.remove();
          done();
        }, 0);
      }, function (r) {
        ruler.remove();
        done(r);
      });
    });

    it('should load fail to load a font and reject the promise', function (done) {
      var font = new FontFace(
            'test2',
            'url(unknown.eot?#iefix) format("embedded-opentype"),' +
            'url(unknown.woff) format("woff")',
            {}
          );

      FontFaceObserver.DEFAULT_TIMEOUT = 50;

      font.load().then(function (x) {
        done(new Error('Should not be called'));
      }, function (r) {
        done();
      });
    });

    it('should load a font and resolve the promise even if the font is already loaded', function (done) {
      var font = new FontFace(
            'test3',
            'url(assets/sourcesanspro-regular.eot?#iefix) format("embedded-opentype"),' +
            'url(assets/sourcesanspro-regular.woff) format("woff")',
            {}
          ),
          ruler = new Ruler('hello world'),
          before = -1;

      FontFaceObserver.DEFAULT_TIMEOUT = 200;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();
      ruler.setStyle(font.getStyle());
      font.load().then(function (x) {
        font.load().then(function (x) {
          ruler.remove();
          done();
        }, function (r) {
          ruler.remove();
          done(r);
        });
      }, function (r) {
        ruler.remove();
        done(r);
      });
    });

    it('removes the stylesheet if the font fails to load', function (done) {
      var font = new FontFace(
            'test4',
            'url(unknown?#iefix) format("embedded-opentype"),' +
            'url(unknown.woff) format("woff")',
            {}
          );

      FontFaceObserver.DEFAULT_TIMEOUT = 50;

      var count = document.styleSheets.length;

      font.load().then(function () {
        done(new Error('Should not call resolve'));
      }, function (r) {
        expect(document.styleSheets.length, 'to equal', count);
        done();
      });
    });

    it('loads a font with a custom unicode range within ASCII', function (done) {
      var font = new FontFace(
            'test5',
            'url(assets/subset.eot?#iefix) format("embedded-opentype"),' +
            'url(assets/subset.woff) format("woff")',
            {
              unicodeRange: 'u+0021'
            }
          ),
          ruler = new Ruler('\u0021'),
          before = -1;

      FontFaceObserver.DEFAULT_TIMEOUT = 200;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();
      ruler.setStyle(font.getStyle());
      font.load().then(function (x) {
        var active = ruler.getWidth();
        expect(active, 'not to equal', before);
        setTimeout(function () {
          var after = ruler.getWidth();
          expect(after, 'to equal', active);
          expect(after, 'not to equal', before);
          ruler.remove();
          done();
        }, 0);
      }, function (r) {
        ruler.remove();
        done(r);
      });
    });

    it('loads a font with a custom unicode range outside ASCII (but within the BMP)', function (done) {
      var font = new FontFace(
            'test6',
            'url(assets/subset.eot?#iefix) format("embedded-opentype"),' +
            'url(assets/subset.woff) format("woff")',
            {
              unicodeRange: 'u+4e2d,u+56fd'
            }
          ),
          ruler = new Ruler('\u4e2d\u56fd'),
          before = -1;

      FontFaceObserver.DEFAULT_TIMEOUT = 200;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();
      ruler.setStyle(font.getStyle());
      font.load().then(function (x) {
        var active = ruler.getWidth();
        expect(active, 'not to equal', before);
        setTimeout(function () {
          var after = ruler.getWidth();
          expect(after, 'to equal', active);
          expect(after, 'not to equal', before);
          ruler.remove();
          done();
        }, 0);
      }, function (r) {
        ruler.remove();
        done(r);
      });
    });

    it('loads a font with a custom unicode range outside the BMP', function (done) {
      var font = new FontFace(
            'test7',
            'url(assets/subset.eot?#iefix) format("embedded-opentype"),' +
            'url(assets/subset.woff) format("woff")',
            {
              unicodeRange: 'u+10ffff'
            }
          ),
          ruler = new Ruler('\udbff\udfff'),
          before = -1;

      FontFaceObserver.DEFAULT_TIMEOUT = 200;

      ruler.insert();
      ruler.setStyle('font-family: monospace');

      before = ruler.getWidth();
      ruler.setStyle(font.getStyle());
      font.load().then(function (x) {
        var active = ruler.getWidth();
        expect(active, 'not to equal', before);
        setTimeout(function () {
          var after = ruler.getWidth();
          expect(after, 'to equal', active);
          expect(after, 'not to equal', before);
          ruler.remove();
          done();
        }, 0);
      }, function (r) {
        ruler.remove();
        done(new Error(r));
      });
    });

    it('rejects the promise if the font loads but is given the wrong unicode range', function (done) {
      var font = new FontFace(
            'test2',
            'url(assets/subset.eot?#iefix) format("embedded-opentype"),' +
            'url(assets/subset.woff) format("woff")',
            {
              unicodeRange: 'u+23' // not in the font
            }
          );

      FontFaceObserver.DEFAULT_TIMEOUT = 50;

      font.load().then(function (x) {
        done(new Error('Should not be called'));
      }, function (r) {
        done();
      });
    });
  });
});
