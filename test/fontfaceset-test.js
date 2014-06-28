describe('FontFaceSet', function () {
  var FontFaceSet = fontloader.FontFaceSet;

  describe('#constructor', function () {
    it('sets the size to zero and status to "loaded"', function () {
      var set = new FontFaceSet();

      expect(set.size, 'to equal', 0);
      expect(set.status, 'to equal', 'loaded');
      expect(set.onloading, 'to equal', goog.nullFunction);
      expect(set.onloadingdone, 'to equal', goog.nullFunction);
      expect(set.onloadingerror, 'to equal', goog.nullFunction);
    });
  });

  describe('#add', function () {
    it('adds non duplicate items', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.size, 'to equal', 3);
      expect(set.data, 'to equal', [1, 2, 3]);
    });

    it('adds duplicate items only once', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(2);

      set.add(1);
      set.add(2);

      expect(set.size, 'to equal', 2);
      expect(set.data, 'to equal', [1, 2]);
    });
  });

  describe('#has', function () {
    it('has items that are in the set', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(3);

      expect(set.has(1), 'to be true');
      expect(set.has(3), 'to be true');
    });

    it('does not have items that are in the set', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(3);

      expect(set.has(2), 'to be false');
      expect(set.has(4), 'to be false');
    });
  });

  describe('#delete', function () {
    it('removes the value and returns true', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(2);
      set.add(3);

      expect(set.delete(2), 'to be true');
      expect(set.size, 'to equal', 2);
      expect(set.has(1), 'to be true');
      expect(set.has(2), 'to be false');
      expect(set.has(3), 'to be true');
    });

    it('returns false if the value was not found', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(2);

      expect(set.delete(3), 'to be false');
      expect(set.size, 'to equal', 2);
      expect(set.has(1), 'to be true');
      expect(set.has(2), 'to be true');
    });
  });

  describe('#clear', function () {
    it('removes all values from the set', function () {
      var set = new FontFaceSet();

      set.add(1);
      set.add(2);

      set.clear();
      expect(set.size, 'to equal', 0);
      expect(set.data, 'to equal', []);
    });
  });

  describe('#forEach', function () {
    it('iterates over all values', function () {
      var set = new FontFaceSet(),
          values = [];

      set.add(1);
      set.add(2);

      set.forEach(function (value, key, set) {
        values.push([value, key, set]);
      });

      expect(values, 'to equal', [[1, 1, set], [2, 2, set]]);
    });
  });

  describe('#match', function () {
    it('returns an empty array', function () {
      var set = new FontFaceSet();

      expect(set.match('300px "My Family"'), 'to have length', 0);
    });

    it('returns one match', function () {
      var set = new FontFaceSet(),
          font = new FontFace('My Family', 'url(font.woff)', {});

      set.add(font);

      expect(set.match('16px "My Family"'), 'to equal', [font]);
    });

    it('returns two matches', function () {
      var set = new FontFaceSet(),
          font1 = new FontFace('My Family', 'url(font.woff)', {}),
          font2 = new FontFace('My Other Family', 'url(font.woff)', {});

      set.add(font1);
      set.add(font2);

      expect(set.match('16px "My Family", "My Other Family"'), 'to equal', [font1, font2]);
    });

    it('returns one match out of two possible', function () {
      var set = new FontFaceSet(),
          font1 = new FontFace('My Family', 'url(font.woff)', {}),
          font2 = new FontFace('My Other Family', 'url(font.woff)', {});

      set.add(font1);
      set.add(font2);

      expect(set.match('16px "My Other Family"'), 'to equal', [font2]);
    });

    it('rejects a match because of a mismatching unicode range', function () {
      var set = new FontFaceSet(),
          font = new FontFace('My Family', 'url(font.woff)', { unicodeRange: 'u+0' });

      set.add(font);

      expect(set.match('16px "My Family"'), 'to equal', []);
    });
  });
});
