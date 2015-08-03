describe('FontFace', function () {
  var FontFace = fl.FontFace;

  describe('#constructor', function () {
    it('accepts family names starting with non-valid identifier characters', function () {
      expect(new FontFace('3four', 'url(font.woff)').family, 'to equal', '3four');
      expect(new FontFace('-5f', 'url(font.woff)').family, 'to equal', '-5f');
      expect(new FontFace('--vendor', 'url(font.woff)').family, 'to equal', '--vendor');
    });

    it('parses descriptors', function () {
      expect(new FontFace('My Family', 'url(font.woff)', { style: 'italic' }).style, 'to equal', 'italic');
      expect(new FontFace('My Family', 'url(font.woff)', { weight: 'bold' }).weight, 'to equal', 'bold');
      expect(new FontFace('My Family', 'url(font.woff)', { stretch: 'condensed' }).stretch, 'to equal', 'condensed');
      expect(new FontFace('My Family', 'url(font.woff)', { variant: 'small-caps' }).variant, 'to equal', 'small-caps');
    });

    it('defaults descriptors if not given', function () {
      var font = new FontFace('My Family', 'url(font.woff)');

      expect(font.style, 'to equal', 'normal');
      expect(font.weight, 'to equal', 'normal');
      expect(font.variant, 'to equal', 'normal');
    });
  });

  describe('#getMatchingUrls', function () {
    it('returns the first URL if there are no format identifiers', function () {
      var font = new FontFace('My Family', 'url(font.woff), url(font.otf)');

      expect(font.getMatchingUrls(['woff', 'opentype']), 'to equal', 'font.woff');
    });

    it('returns the first matching format URL', function () {
      var font = new FontFace('My Family', 'url(font.woff) format("woff"), url(font.otf) format("opentype")');

      expect(font.getMatchingUrls(['woff']), 'to equal', 'font.woff');
      expect(font.getMatchingUrls(['opentype']), 'to equal', 'font.otf');
    });

    it('returns null when the browser does not support anything', function () {
      var font = new FontFace('My Family', 'url(font.woff) format("woff"), url(font.otf) format("opentype")');

      expect(font.getMatchingUrls([]), 'to be null');
    });
  });

  describe('#load', function () {
    it('resolves when a font loads', function (done) {
      this.timeout(6000);
      var font = new FontFace('My Family', 'url(./assets/sourcesanspro-regular.woff) format("woff"), url(./assets/sourcesanspro-regular.ttf) format("truetype")');

      expect(font.status, 'to equal', 'unloaded');

      font.load().then(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', 'loaded');
        done();
      }).catch(function () {
        done(new Error('Should not fail'));
      });
    });

    it('rejects when a font fails to load', function (done) {
      var font = new FontFace('My Family', 'url(./assets/unknown.woff) format("woff"), url(./assets/unknown.ttf) format("truetype")');

      expect(font.status, 'to equal', 'unloaded');

      font.load().then(function (f) {
        done(new Error('Should not succeed'));
      }).catch(function (f) {
        expect(font, 'to equal', f);
        expect(font.status, 'to equal', 'error');
        done();
      });
    });

    it('loads immediately when given an arraybuffer', function (done) {
      var font = new FontFace('My Family', new ArrayBuffer(4), {});

      expect(font.status, 'to equal', "loaded");

      font.load().then(function (f) {
        expect(font.status, 'to equal', "loaded");
        expect(f, 'to equal', font);
        done();
      }, function (r) {
        done(r);
      });
    });
  });

  describe('#insert', function () {
    it('inserts a @font-face rule into the DOM', function () {
      var font = new FontFace('My Family', new ArrayBuffer(4), {});

      font.insert();

      expect(font.rule, 'not to be null');
      expect(font.rule.parentStyleSheet, 'not to be null');
    });

    it('inserts multiple @font-face rules into the DOM', function () {
      var font1 = new FontFace('Font1', new ArrayBuffer(4), {}),
          font2 = new FontFace('Font2', new ArrayBuffer(4), {});

      font1.insert();
      font2.insert();

      expect(font1.rule, 'not to be null');
      expect(font1.rule.parentStyleSheet, 'not to be null');
      expect(font2.rule, 'not to be null');
      expect(font2.rule.parentStyleSheet, 'not to be null');

      expect(font1.rule.parentStyleSheet, 'to equal', font2.rule.parentStyleSheet);
    });
  });

  describe('#remove', function () {
    it('removes @ font-face rule from the DOM', function () {
      var font = new FontFace('My Family', new ArrayBuffer(4), {});

      font.insert();

      expect(font.rule, 'not to be null');
      expect(font.rule.parentStyleSheet, 'not to be null');

      font.remove();
      expect(font.rule, 'to be null');
    });

    it('removes multiple @font-face rules from the DOM', function () {
      var font1 = new FontFace('Font1', new ArrayBuffer(4), {}),
          font2 = new FontFace('Font2', new ArrayBuffer(4), {});

      font1.insert();
      font2.insert();

      expect(font1.rule, 'not to be null');
      expect(font1.rule.parentStyleSheet, 'not to be null');
      expect(font2.rule, 'not to be null');
      expect(font2.rule.parentStyleSheet, 'not to be null');

      expect(font1.rule.parentStyleSheet, 'to equal', font2.rule.parentStyleSheet);

      font1.remove();
      expect(font1.rule, 'to be null');
      expect(font2.rule, 'not to be null');
      expect(font2.rule.parentStyleSheet, 'not to be null');

      font2.remove();

      expect(font2.rule, 'to be null');
    });
  });
});
