describe('util', function () {
  var util = fontloader.util;

  describe('extend', function () {
    it('returns undefined when used without arguments', function () {
      expect(util.extend()).to.eql(undefined);
    });

    it('returns the first argument', function () {
      expect(util.extend({ hello: 'world' })).to.eql({ hello: 'world' });
    });

    it('copies properties from one object to another', function () {
      expect(util.extend({}, { hello: 'world' })).to.eql({ hello: 'world' });
    });

    it('accepts more than two arguments', function () {
      expect(util.extend({}, {}, { hello: 'world' })).to.eql({ hello: 'world' });
    });

    it('overwrites redefined properties', function () {
      expect(util.extend({ hello: 'world' }, { hello: 'human' })).to.eql({ hello: 'human' });
    });
  });

  describe('nonNativeIsArray', function () {
    it('returns true when the value is an array', function () {
      expect(util.isArray([])).to.be(true);
      expect(util.isArray([1, 2])).to.be(true);
      expect(util.isArray(new Array())).to.be(true);
    });

    it('returns false when the value is not an array', function () {
      expect(util.isArray({})).to.be(false);
      expect(util.isArray(1)).to.be(false);
      expect(util.isArray('array')).to.be(false);
    });
  });
});
