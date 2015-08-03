describe('FontFaceSet', function () {
  var FontFaceSet = fl.FontFaceSet,
      FontFace = fl.FontFace,

      font1 = null,
      font2 = null,
      font3 = null,
      font4 = null;

  beforeEach(function () {
    font1 = new FontFace('1', 'url(font.woff)', {});
    font2 = new FontFace('2', 'url(font.woff)', {});
    font3 = new FontFace('3', 'url(font.woff)', {});
    font4 = new FontFace('4', 'url(font.woff)', {});
  });


  describe('#constructor', function () {
    it('sets the size to zero and status to "loaded"', function () {
      var set = new FontFaceSet();

      expect(set.size, 'to equal', 0);
      expect(set.status, 'to equal', 'loaded');
    });
  });

  describe('#add', function () {
    it('adds non duplicate items', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font2);
      set.add(font3);

      expect(set.size, 'to equal', 3);
      expect(set.fonts, 'to equal', [font1, font2, font3]);
    });

    it('adds duplicate items only once', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font2);

      set.add(font1);
      set.add(font2);

      expect(set.size, 'to equal', 2);
      expect(set.fonts, 'to equal', [font1, font2]);
    });
  });

  describe('#has', function () {
    it('has items that are in the set', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font3);

      expect(set.has(font1), 'to be true');
      expect(set.has(font3), 'to be true');
    });

    it('does not have items that are in the set', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font3);

      expect(set.has(font2), 'to be false');
      expect(set.has(font4), 'to be false');
    });
  });

  describe('#delete', function () {
    it('removes the value and returns true', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font2);
      set.add(font3);

      expect(set.delete(font2), 'to be true');
      expect(set.size, 'to equal', 2);
      expect(set.has(font1), 'to be true');
      expect(set.has(font2), 'to be false');
      expect(set.has(font3), 'to be true');
    });

    it('returns false if the value was not found', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font2);

      expect(set.delete(font3), 'to be false');
      expect(set.size, 'to equal', 2);
      expect(set.has(font1), 'to be true');
      expect(set.has(font2), 'to be true');
    });
  });

  describe('#clear', function () {
    it('removes all values from the set', function () {
      var set = new FontFaceSet();

      set.add(font1);
      set.add(font2);

      set.clear();
      expect(set.size, 'to equal', 0);
      expect(set.fonts, 'to equal', []);
    });
  });

  describe('#forEach', function () {
    it('iterates over all values', function () {
      var set = new FontFaceSet(),
          values = [];

      set.add(font1);
      set.add(font2);

      set.forEach(function (value, key, set) {
        values.push([value, key, set]);
      });

      expect(values, 'to equal', [[font1, 0, set], [font2, 1, set]]);
    });
  });

  describe('#match', function () {
    it('returns an empty array', function () {
      var set = new FontFaceSet();

      expect(set.match('300px "My Family"'), 'to have length', 0);
    });

    it('returns one match', function () {
      var set = new FontFaceSet(),
          font = new FontFace('My Family', 'url(font.woff)');

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

    it('returns null on an invalid font string', function () {
      var set = new FontFaceSet();

      expect(set.match('san-see'), 'to be null');
    });

    xit('rejects a match because of a mismatching unicode range', function () {
      var set = new FontFaceSet(),
          font = new FontFace('My Family', 'url(font.woff)', { unicodeRange: 'u+0' });

      set.add(font);

      expect(set.match('16px "My Family"'), 'to equal', []);
    });
  });

  describe('#load', function () {
    it('loads a font', function (done) {
      var set = new FontFaceSet(),
          font = new FontFace('Font1', 'url(./assets/sourcesanspro-regular.woff) format("woff"), url(./assets/sourcesanspro-regular.ttf) format("truetype")');

      set.add(font);

      set.load('16px Font1').then(function (fonts) {
        expect(set.status, 'to equal', 'loaded');
        expect(fonts[0], 'to equal', font);
        done();
      }).catch(function () {
        done(new Error('Should not be called'));
      });
    });

    it('fails to load a font', function (done) {
      var set = new FontFaceSet(),
          font = new FontFace('Font2', 'url(unknown.woff) format("woff"), url(unknown.ttf) format("truetype")');

      set.add(font);

      set.load('16px Font2').then(function (fonts) {
        expect(set.status, 'to equal', 'loaded');
        expect(fonts, 'to equal', [font]);
        done();
      }).catch(function () {
        done(new Error('Should not be called'));
      });
    });

    it('returns an empty array when there are no matches in the set', function (done) {
      var set = new FontFaceSet();

      set.load('16px Font').then(function (fonts) {
        expect(set.status, 'to equal', 'loaded');
        expect(fonts, 'to equal', []);
        done();
      }).catch(function () {
        done(new Error('Should not be called'));
      });
    });

    it('rejects the promise if the font string is invalid', function (done) {
      var set = new FontFaceSet();

      set.load('see-sa').then(function () {
        done(new Error('Should not be called'));
      }).catch(function (fonts) {
        expect(fonts, 'to equal', []);
        done();
      });
    });

    it('loads multiple matching fonts', function (done) {
      var set = new FontFaceSet(),
          font1 = new FontFace('Font1', 'url(./assets/sourcesanspro-regular.woff) format("woff"), url(./assets/sourcesanspro-regular.ttf) format("truetype")'),
          font2 = new FontFace('Font2', 'url(./assets/sourcesanspro-regular.woff) format("woff"), url(./assets/sourcesanspro-regular.ttf) format("truetype")');

      set.add(font1);
      set.add(font2);

      set.load('16px Font1, Font2').then(function (fonts) {
        expect(set.status, 'to equal', 'loaded');
        expect(fonts, 'to equal', [font1, font2]);
        done();
      }).catch(function () {
        done(new Error('Should not be called'));
      });
    });

    it('loads a preloaded font', function (done) {
      var set = new FontFaceSet(),
          font = new FontFace('Font1', 'url(./assets/sourcesanspro-regular.woff) format("woff"), url(./assets/sourcesanspro-regular.ttf) format("truetype")');

      font.load().then(function () {
        set.add(font);

        set.load('16px Font1').then(function (fonts) {
          expect(set.status, 'to equal', 'loaded');
          expect(fonts, 'to equal', [font]);
          done();
        }).catch(function () {
          done(new Error('Should not be called'));
        });
      });
    });
  });

  describe('#check', function () {
    it('returns true if the family is in the set and loaded', function () {
      var set = new FontFaceSet(),
          font1 = new FontFace('My Family', new ArrayBuffer(1));

      set.add(font1);

      expect(set.check('16px My Family'), 'to be true');
    });

    it('returns false if the family is not in the set', function () {
      var set = new FontFaceSet();

      expect(set.check('16px My Family'), 'to be false');
    });

    it('returns false if the family is in the set and not loaded', function () {
      var set = new FontFaceSet(),
          font1 = new FontFace('My Other Family', 'url(font.woff)');

      set.add(font1);

      expect(set.check('16px My Other Family'), 'to be false');
    });

    it('returns false if only some of the fonts are loaded', function () {
      var set = new FontFaceSet(),
          font1 = new FontFace('My Family', new ArrayBuffer(1)),
          font2 = new FontFace('My Other Family', 'url(font.woff)');

      set.add(font1);
      set.add(font2);

      expect(set.check('16px My Family'), 'to be true');
      expect(set.check('16px My Other Family'), 'to be false');

      expect(set.check('16px My Family, My Other Family'), 'to be false');
    });
  });
});
