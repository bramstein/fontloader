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

  describe('#load', function () {
    it('resolves when a font loads', function (done) {
      var font = new FontFace('My Family', 'url(./assets/sourcesanspro-regular.woff)');

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
      var font = new FontFace('My Family', 'url(./assets/unknown.woff)');

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
});
