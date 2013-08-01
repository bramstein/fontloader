describe('fontloader.FontWatcher', function () {
  var FontWatcher = fontloader.FontWatcher,
      Ruler = fontloader.Ruler;

  describe('#constructor', function () {
    it('should set up a valid instance and create a font cache', function () {
      var fontWatcher = new FontWatcher({}, 'test');

      expect(fontWatcher.text).to.eql('test');
      expect(fontWatcher.fontCache).to.not.be(undefined);
      expect(fontWatcher.fontCache.sansserif).to.not.be(0);
      expect(fontWatcher.fontCache.serif).to.not.be(0);
      expect(fontWatcher.fontCache.monospace).to.not.be(0);
    });
  });

  describe('#isFallbackFont', function () {
    var fontWatcher = null;

    beforeEach(function () {
      fontWatcher = new FontWatcher({}, 'test');

      fontWatcher.fontCache = {
        sansserif: 10,
        serif: 12,
        monospace: 15
      };
    });

    it('returns true when the widths match the fallback fonts (sans-serif and serif)', function () {
      expect(fontWatcher.isFallbackFont(10, 12)).to.be(true);
    });

    it('returns false when the one or two of the widths do not match the fallback fonts', function () {
      expect(fontWatcher.isFallbackFont(10, 13)).to.be(false);
      expect(fontWatcher.isFallbackFont(11, 13)).to.be(false);
    });
  });

  describe('#isLastResortFont', function () {
    var fontWatcher = null;

    beforeEach(function () {
      fontWatcher = new FontWatcher({}, 'test');

      fontWatcher.fontCache = {
        sansserif: 10,
        serif: 12,
        monospace: 15
      };

      FontWatcher.HAS_WEBKIT_FALLBACK_BUG = true;
    });

    it('returns false when the WebKit fallback bug is not present even if it matches a last resort font', function () {
      FontWatcher.HAS_WEBKIT_FALLBACK_BUG = false;

      expect(fontWatcher.isLastResortFont(10, 10)).to.be(false);
      expect(fontWatcher.isLastResortFont(12, 12)).to.be(false);
      expect(fontWatcher.isLastResortFont(15, 15)).to.be(false);
    });

    it('returns true if it matches one of the last resort fonts', function () {
      expect(fontWatcher.isLastResortFont(10, 10)).to.be(true);
      expect(fontWatcher.isLastResortFont(12, 12)).to.be(true);
      expect(fontWatcher.isLastResortFont(15, 15)).to.be(true);
    });

    it('returns false if it does not match any of the last resort fonts', function () {
      expect(fontWatcher.isLastResortFont(10, 11)).to.be(false);
      expect(fontWatcher.isLastResortFont(13, 13)).to.be(false);
    });
  });

  describe('#start', function () {
    beforeEach(function () {
      FontWatcher.HAS_WEBKIT_FALLBACK_BUG = null;
      FontWatcher.DEFAULT_TIMEOUT = 5000;
    });

    it('should fail to load a nonexistent font and create a timeout error', function (done) {
      var fontWatcher = new FontWatcher({}, 'hello world');

      FontWatcher.DEFAULT_TIMEOUT = 100;

      fontWatcher.start({ 'font-family': 'MyFont' }, function (err, font) {
        expect(err).not.to.be(null);
        expect(err.message).to.eql('Timeout');
        expect(font).to.eql({ 'font-family': 'MyFont' });
        done();
      });
    });

    it('should fail to load a broken font and create a timeout error', function (done) {
      var fontWatcher = new FontWatcher({}, 'hello world');

      FontWatcher.DEFAULT_TIMEOUT = 100;

      loadStylesheet('assets/brokenfont/brokenfont-regular.css');

      fontWatcher.start({ 'font-family': 'Broken Font Regular' }, function (err, font) {
        expect(err).not.to.be(null);
        expect(err.message).to.eql('Timeout');
        expect(font).to.eql({ 'font-family': 'Broken Font Regular' });
        done();
      });
    });

    it('should load a real font and call the callback', function (done) {
      var fontWatcher = new FontWatcher({}, 'hello world'),
          ruler = new Ruler('hello world'),
          beforeWidth = -1;

      ruler.insert();
      ruler.setStyle({ 'font-family': 'monospace' });

      beforeWidth = ruler.getWidth();

      loadStylesheet('assets/sourcesanspro/sourcesanspro-regular.css');

      ruler.setStyle({ 'font-family': ['Source Sans Pro Regular Web Font', 'monospace'] });

      fontWatcher.start({ 'font-family': 'Source Sans Pro Regular Web Font' }, function (err, font) {
        var activeWidth = ruler.getWidth();

        window.setTimeout(function () {
          var afterWidth = ruler.getWidth();

          expect(err).to.be(null);
          expect(font).to.eql({ 'font-family': 'Source Sans Pro Regular Web Font' });
          expect(activeWidth).to.not.eql(beforeWidth);
          expect(afterWidth).to.eql(activeWidth);
          expect(afterWidth).not.to.eql(beforeWidth);
          ruler.remove();
          done();
        }, 100);
      });
    });

    it('should load a real font and call the callback even if @font-face is available after the watching has started', function (done) {
      var fontWatcher = new FontWatcher({}, 'hello world'),
          ruler = new Ruler('hello world'),
          beforeWidth = -1;

      ruler.insert();
      ruler.setStyle({ 'font-family': 'monospace' });

      beforeWidth = ruler.getWidth();

      ruler.setStyle({ 'font-family': ['Source Sans Pro Italic Web Font', 'monospace'] });

      fontWatcher.start({ 'font-family': 'Source Sans Pro Italic Web Font' }, function (err, font) {
        var activeWidth = ruler.getWidth();

        window.setTimeout(function () {
          var afterWidth = ruler.getWidth();

          expect(err).to.be(null);
          expect(font).to.eql({ 'font-family': 'Source Sans Pro Italic Web Font' });
          expect(activeWidth).to.not.eql(beforeWidth);
          expect(afterWidth).to.eql(activeWidth);
          expect(afterWidth).not.to.eql(beforeWidth);
          ruler.remove();
          done();
        }, 100);
      });

      loadStylesheet('assets/sourcesanspro/sourcesanspro-it.css');
    });
  });

  describe('#hasWebKitFallbackBug', function () {
    var fontWatcher = null,
        getUserAgent = null,
        userAgent = null;

    beforeEach(function () {
      fontWatcher = new FontWatcher({}, '');

      FontWatcher.HAS_WEBKIT_FALLBACK_BUG = null;

      getUserAgent = sinon.stub(fontWatcher, 'getUserAgent').returns(userAgent);
    });

    afterEach(function () {
      getUserAgent.restore();
    });

    it('returns false when the user agent is not WebKit', function () {
      getUserAgent.returns('Mozilla/5.0 (Android; Mobile; rv:13.0) Gecko/15.0 Firefox/14.0');

      expect(fontWatcher.hasWebKitFallbackBug()).to.be(false);
    });

    it('returns false when the user agent is WebKit but the bug is not present', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.12 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/536.12');

      expect(fontWatcher.hasWebKitFallbackBug()).to.be(false);
    });

    it('returns true when the user agent is WebKit and the bug is present', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/536.11');

      expect(fontWatcher.hasWebKitFallbackBug()).to.be(true);
    });

    it('returns true when the user agent is WebKit and the bug is present in an old version', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/535.19');

      expect(fontWatcher.hasWebKitFallbackBug()).to.be(true);
    });

    it('caches the results', function () {
      getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.814.2 Safari/536.11');

      expect(fontWatcher.hasWebKitFallbackBug()).to.be(true);

      getUserAgent.returns('Mozilla/5.0 (Android; Mobile; rv:13.0) Gecko/15.0 Firefox/14.0');

      expect(fontWatcher.hasWebKitFallbackBug()).to.be(true);
    });
  });
});
