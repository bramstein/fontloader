describe('util', function () {
  var util = fontloader.util;

  describe('extend', function () {
    it('returns undefined when used without arguments', function () {
      expect(util.extend(), 'to equal', undefined);
    });

    it('returns the first argument', function () {
      expect(util.extend({ hello: 'world' }), 'to equal', { hello: 'world' });
    });

    it('copies properties from one object to another', function () {
      expect(util.extend({}, { hello: 'world' }), 'to equal', { hello: 'world' });
    });

    it('accepts more than two arguments', function () {
      expect(util.extend({}, {}, { hello: 'world' }), 'to equal', { hello: 'world' });
    });

    it('overwrites redefined properties', function () {
      expect(util.extend({ hello: 'world' }, { hello: 'human' }), 'to equal', { hello: 'human' });
    });
  });
});
