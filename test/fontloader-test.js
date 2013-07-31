describe('fontloader API', function () {
  it('succesfully loads a font and calls the correct callback', function (done) {
    loadStylesheet('assets/sourcesanspro/sourcesanspro-black.css');

    fontloader.onloading = sinon.spy();
    fontloader.onloadingdone = sinon.spy();
    fontloader.onloadstart = sinon.spy();
    fontloader.onload = sinon.spy();
    fontloader.onerror = sinon.spy();

    fontloader.loadFont({
      font: '13px Source Sans Pro Black Web Font',
      success: function () {
        var sourceSansProBlack = {
          error: null,
          fontface: 'Source Sans Pro Black Web Font'
        };

        expect(fontloader.loading).to.be(false);

        expect(fontloader.onloading.calledOnce).to.be(true);
        expect(fontloader.onloading.calledWith(sourceSansProBlack)).to.be(true);

        expect(fontloader.onloadingdone.calledOnce).to.be(true);
        expect(fontloader.onloadingdone.calledWith(sourceSansProBlack)).to.be(true);

        expect(fontloader.onloadstart.calledOnce).to.be(true);
        expect(fontloader.onloadstart.calledWith(sourceSansProBlack)).to.be(true);

        expect(fontloader.onload.calledOnce).to.be(true);
        expect(fontloader.onload.calledWith(sourceSansProBlack)).to.be(true);

        expect(fontloader.onerror.callCount).to.eql(0);

        done();
      },
      error: function () {
        done(new Error('Should not fail'));
      }
    });
  });

  it('successfully loads multiple fonts and calls the correct callbacks', function (done) {
    loadStylesheet('assets/sourcesanspro/sourcesanspro-light.css');
    loadStylesheet('assets/sourcesanspro/sourcesanspro-lightit.css');

    fontloader.onloading = sinon.spy();
    fontloader.onloadingdone = sinon.spy();
    fontloader.onloadstart = sinon.spy();
    fontloader.onload = sinon.spy();
    fontloader.onerror = sinon.spy();

    fontloader.loadFont({
      font: '16px Source Sans Pro Light Web Font, Source Sans Pro Light Italic Web Font',
      success: function () {
        var sourceSansProLight = {
              error: null,
              fontface: 'Source Sans Pro Light Web Font'
            },
            sourceSansProLightItalic = {
              error: null,
              fontface: 'Source Sans Pro Light Italic Web Font'
            };

        expect(fontloader.loading).to.be(false);

        expect(fontloader.onloading.calledOnce).to.be(true);
        expect(fontloader.onloading.calledWith(sourceSansProLight)).to.be(true);

        expect(fontloader.onloadingdone.calledOnce).to.be(true);
        expect(fontloader.onloadingdone.calledWith(sourceSansProLightItalic)).to.be(true);

        expect(fontloader.onloadstart.calledTwice).to.be(true);
        expect(fontloader.onloadstart.calledWith(sourceSansProLight)).to.be(true);
        expect(fontloader.onloadstart.calledWith(sourceSansProLightItalic)).to.be(true);

        expect(fontloader.onload.calledTwice).to.be(true);
        expect(fontloader.onload.calledWith(sourceSansProLight)).to.be(true);
        expect(fontloader.onload.calledWith(sourceSansProLightItalic)).to.be(true);

        expect(fontloader.onerror.callCount).to.eql(0);

        done();
      },
      error: function () {
        done(new Error('Should not fail'));
      }
    });
  });
});
