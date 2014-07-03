describe('CSSFontFaceRule', function () {
  var CSSFontFaceRule = fontloader.CSSFontFaceRule,
      cssRule = null,
      styleElement = null;

  function insertRule(cssText) {
    styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(cssText));

    document.head.appendChild(styleElement);

    cssRule = styleElement.sheet.cssRules[0];
  }

  function deleteRule() {
    document.head.removeChild(styleElement);
    styleElement = null;
    cssRule = null;
  }

  afterEach(function () {
    deleteRule();
  });

  describe('#constructor', function () {
    it('creates a wrapper', function () {
      insertRule('@font-face{font-family:test;}');

      var rule = new CSSFontFaceRule(cssRule);

      expect(rule.style, 'to be an object');
      expect(rule.parentStyleSheet, 'to equal', styleElement.sheet);
      expect(rule.cssText, 'to match', /^@font-face\s*{\s*font-family:\s*['"]?test['"]?;\s*}\s*$/);
    });

    it('creates a wrapper from an existing CSSRule with content', function () {
      insertRule('@font-face{font-family: test;font-weight:500;}');

      var rule = new CSSFontFaceRule(cssRule);
      expect(rule.cssText, 'to match', /^@font-face\s*{\s*font-family:\s*['"]?test['"]?;\s*font-weight:\s*500;\s*}\s*$/);
    });
  });

  describe('@cssText', function () {
    xit('can set cssText', function () {
      insertRule('@font-face{font-family:test;}');

      var rule = new CSSFontFaceRule(cssRule);

      rule.cssText = '@font-face{font-family:hello;}';

      expect(rule.cssText, 'to match', /^@font-face\s*{\s*font-family:\s*['"]?hello['"]?;\s*}\s*$/);
    });
  });

  describe('@style', function () {
    it('reflects the properties given in the original css rule', function () {
      insertRule('@font-face{font-family:test;font-weight:500;font-style:italic;}');

      var rule = new CSSFontFaceRule(cssRule);

      expect(rule.style['font-weight'], 'to equal', '500');
      expect(rule.style['font-style'], 'to equal', 'italic');
    });

    it('updates the original rule when given new values', function () {
      insertRule('@font-face{font-family:test;font-weight:500;font-style:italic;}');

      var rule = new CSSFontFaceRule(cssRule);

      rule.style['font-weight'] = '300';
      rule.style['font-style'] = 'normal';

      expect(rule.style['font-weight'], 'to equal', '300');
      expect(rule.style['font-style'], 'to equal', 'normal');
    });

    it('returns a value for the font-variant property', function () {
      insertRule('@font-face{font-variant:normal;}');

      var rule = new CSSFontFaceRule(cssRule);

      expect(rule.style['font-variant'], 'to equal', 'normal');
    });

    // This is disabled because it fails on Firefox. No matter
    // what we set font-variant to, it always returns the empty
    // string.
    xit('sets the font-variant property', function () {
      insertRule('@font-face{font-variant:normal;}');

      var rule = new CSSFontFaceRule(cssRule);

      rule.style['font-variant'] = 'small-caps';

      expect(rule.style['font-variant'], 'to equal', 'small-caps');
    });
  });

  describe('#update', function () {
    // This is broken on IE9 because it doesn't allow setting
    // of the cssText of a CSSRule. Fortunately, setting properties
    // individually works on IE9 so we're not actually using this
    // method.
    it('updates the rule', function () {
      insertRule('@font-face{font-family:test;}');

      var rule = new CSSFontFaceRule(cssRule);

      rule.update('@font-face{font-family:test;font-weight:500;}');

      expect(rule.cssText, 'to match', /^@font-face\s*{\s*font-family:\s*['"]?test['"]?;\s*font-weight:\s*500;\s*}\s*$/);
    });
  });

  describe('#delete', function () {
    it('removes the rule', function () {
      insertRule('@font-face{}');

      var rule = new CSSFontFaceRule(cssRule);

      rule.delete();
      expect(styleElement.sheet.cssRules.length, 'to equal', 0);
    });
  });

  describe('#indexOf', function () {
    it('finds the correct rule', function () {
      insertRule('@font-face{}');

      var rule = new CSSFontFaceRule(cssRule);

      expect(rule.indexOf(), 'to equal', 0);
    });
  });

  describe('#getPropertyValue', function () {
    it('returns property values', function () {
      insertRule('@font-face{font-family:test;font-weight:500;font-style:italic;}');

      var rule = new CSSFontFaceRule(cssRule);

      expect(rule.getPropertyValue('font-weight'), 'to equal', '500');
      expect(rule.getPropertyValue('font-style'), 'to equal', 'italic');
    });
  });

  describe('#setProperty', function () {
    it('sets the property', function () {
      insertRule('@font-face{}');

      var rule = new CSSFontFaceRule(cssRule);

      rule.setProperty('font-weight', '500');

      expect(rule.getPropertyValue('font-weight'), 'to equal', '500');

      rule.setProperty('font-weight', '300');

      expect(rule.getPropertyValue('font-weight'), 'to equal', '300');
    });
  });
});
