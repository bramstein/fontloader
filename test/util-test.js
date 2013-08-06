describe('fontloader.util', function () {
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

  describe('forEach', function () {
    it('iterates over an array and calls the complete callback', function (done) {
      var result = [];
      util.forEach([1, 2, 3], function (value, callback) {
        result.push(value);
        callback();
      }, function () {
        expect(result).to.eql([1, 2, 3]);
        done();
      });
    });

    it('iterates over an array and returns early when an error occurs', function (done) {
      var result = [];

      util.forEach([1, 2, 3], function (value, callback) {
        if (value <= 2) {
          result.push(value);
          callback();
        } else {
          callback(new Error('Something went wrong'));
        }
      }, function (err) {
        expect(result).to.eql([1, 2]);
        expect(err).not.to.be(null);
        done();
      });
    });

    it('iterates over an array with an asynchronous work load', function (done) {
      util.forEach([1, 2, 3], function (value, callback) {
        setTimeout(function () {
          callback();
        }, value);
      }, function (err) {
        done();
      });
    });
  });
});
