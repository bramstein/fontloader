describe('Url', function () {
  var Url = fontloader.css.Url;

  describe('#constructor', function () {
    it('creates an object', function () {
      expect(new Url('a'), 'to have properties', {
        url: 'a',
        format: null
      });
    });
  });

  describe('#toString', function () {
    it('creates a simple url', function () {
      expect(new Url('a').toString(), 'to equal', 'url(a)');
      expect(new Url('/font.woff').toString(), 'to equal', 'url(/font.woff)');
    });

    it('encodes urls correctly', function () {
      expect(new Url('/f o nt.woff').toString(), 'to equal', 'url(/f%20o%20nt.woff)');
      expect(new Url('/\u6bdf.woff').toString(), 'to equal', 'url(/%E6%AF%9F.woff)');
    });

    it('adds a format if available', function () {
      expect(new Url('/font.woff', 'woff').toString(), 'to equal', 'url(/font.woff) format(\'woff\')');
    });
  });
});
