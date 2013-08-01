describe('fontloader API', function () {
  this.timeout(5000);

  beforeEach(function () {
    fontloader.FontWatcher.DEFAULT_TIMEOUT = 5000;
  });

  it('succesfully loads a font and calls the correct callback', function (done) {
    loadStylesheet('assets/sourcesanspro/sourcesanspro-black.css');

    fontloader.onloading = sinon.spy();
    fontloader.onloadingdone = sinon.spy();
    fontloader.onloadstart = sinon.spy();
    fontloader.onload = sinon.spy();
    fontloader.onerror = sinon.spy();

    fontloader.loadFont({
      font: '13px Source Sans Pro Black',
      success: function () {
        var sourceSansProBlack = {
          error: null,
          fontface: 'Source Sans Pro Black'
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
      font: '16px Source Sans Pro Light, Source Sans Pro Light Italic',
      success: function () {
        var sourceSansProLight = {
              error: null,
              fontface: 'Source Sans Pro Light'
            },
            sourceSansProLightItalic = {
              error: null,
              fontface: 'Source Sans Pro Light Italic'
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

  it('fails to load a single font and calls the correct callbacks', function (done) {
    loadStylesheet('assets/brokenfont/brokenfont-bold.css');

    fontloader.FontWatcher.DEFAULT_TIMEOUT = 100;

    fontloader.onloading = sinon.spy();
    fontloader.onloadingdone = sinon.spy();
    fontloader.onloadstart = sinon.spy();
    fontloader.onload = sinon.spy();
    fontloader.onerror = sinon.spy();

    fontloader.loadFont({
      font: '13px Broken Font Bold',
      success: function () {
        done(new Error('Should not succeed'));
      },
      error: function () {
        expect(fontloader.loading).to.be(false);

        expect(fontloader.onloading.calledOnce).to.be(true);
        expect(fontloader.onloading.calledWith({ error: null, fontface: 'Broken Font Bold' })).to.be(true);

        expect(fontloader.onloadingdone.calledOnce).to.be(true);
        expect(fontloader.onloadingdone.calledWith({ error: null, fontface: 'Broken Font Bold' })).to.be(true);

        expect(fontloader.onloadstart.calledOnce).to.be(true);
        expect(fontloader.onloadstart.calledWith({ error: null, fontface: 'Broken Font Bold' })).to.be(true);

        expect(fontloader.onload.callCount).to.eql(0);

        expect(fontloader.onerror.calledOnce).to.be(true);
        expect(fontloader.onerror.firstCall.args[0].fontface).to.eql('Broken Font Bold');
        expect(fontloader.onerror.firstCall.args[0].error.message).to.eql('Timeout');

        done();
      }
    });
  });

  it('fails to load multiple fonts and calls the correct callbacks', function (done) {
    loadStylesheet('assets/brokenfont/brokenfont-italic.css');
    loadStylesheet('assets/brokenfont/brokenfont-light.css');

    fontloader.FontWatcher.DEFAULT_TIMEOUT = 100;

    fontloader.onloading = sinon.spy();
    fontloader.onloadingdone = sinon.spy();
    fontloader.onloadstart = sinon.spy();
    fontloader.onload = sinon.spy();
    fontloader.onerror = sinon.spy();

    fontloader.loadFont({
      font: '13px Broken Font Italic, Broken Font Light',
      success: function () {
        done(new Error('Should not succeed'));
      },
      error: function () {
        expect(fontloader.loading).to.be(false);

        expect(fontloader.onloading.calledOnce).to.be(true);
        expect(fontloader.onloading.calledWith({ error: null, fontface: 'Broken Font Italic' })).to.be(true);

        expect(fontloader.onloadingdone.calledOnce).to.be(true);
        expect(fontloader.onloadingdone.calledWith({ error: null, fontface: 'Broken Font Light' })).to.be(true);

        expect(fontloader.onloadstart.calledTwice).to.be(true);
        expect(fontloader.onloadstart.calledWith({ error: null, fontface: 'Broken Font Italic' })).to.be(true);
        expect(fontloader.onloadstart.calledWith({ error: null, fontface: 'Broken Font Light' })).to.be(true);

        expect(fontloader.onload.callCount).to.eql(0);

        expect(fontloader.onerror.calledTwice).to.be(true);

        if (fontloader.onerror.firstCall.args[0].fontface === 'Broken Font Italic') {
          expect(fontloader.onerror.firstCall.args[0].fontface).to.eql('Broken Font Italic');
          expect(fontloader.onerror.firstCall.args[0].error.message).to.eql('Timeout');
          expect(fontloader.onerror.secondCall.args[0].fontface).to.eql('Broken Font Light');
          expect(fontloader.onerror.secondCall.args[0].error.message).to.eql('Timeout');
        } else {
          expect(fontloader.onerror.firstCall.args[0].fontface).to.eql('Broken Font Light');
          expect(fontloader.onerror.firstCall.args[0].error.message).to.eql('Timeout');
          expect(fontloader.onerror.secondCall.args[0].fontface).to.eql('Broken Font Italic');
          expect(fontloader.onerror.secondCall.args[0].error.message).to.eql('Timeout');
        }
        done();
      }
    });
  });
});
