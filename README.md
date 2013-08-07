## FontLoader Polyfill [![Build Status](https://travis-ci.org/bramstein/fontloader.png?branch=master)](https://travis-ci.org/bramstein/fontloader)

This polyfill implements the [W3C Font Load Events Module Level 3 specification](http://dev.w3.org/csswg/css-font-load-events/). It detects when fonts have loaded and provides callbacks for each font load event. You can use the FontLoader Polyfill to prevent the Flash Of Unstyled Text or execute JavaScript code when fonts have loaded (for example to perform layout or show a user interface element.)

## API

To detect loading of a font you simply call the `loadFont` method.

    document.fontloader.loadFont({
      font: '16px Elena',
      success: function () {
        console.log('Font loaded');
      },
      error: function () {
        console.log('Font failed to load');
      }
    });

It is also possible to use the global callbacks when one or more fonts have loaded:

    document.fontloader.onloading = function () {
      console.log('Loading started');
    };

    document.fontloader.onloadingdone = function () {
      console.log('Loading finished');
    };

    document.fontloader.loadFont({
      font: '16px Elena'
    });

If you need more fine-grained control you can also use the `onloadstart`, `onload` and `onerror` callbacks, which are fired for each font:

    document.fontloader.onloadstart = function (e) {
      console.log('Start loading: %s', e.fontface);
    };

    document.fontloader.onload = function (e) {
      console.log('Finished loading: %s', e.fontface);
    };

    document.fontloader.onerror = function (e) {
      console.log('Failed to load: %s', e.fontface);
    };

    document.fontloader.loadFont({
      font: '16px Elena, Meta Serif'
    });

If both fonts load successfully the `onloadstart` and `onload` callbacks will be called twice each with a font load event.

The `checkFont` and `notifyWhenFontsReady` methods as defined in the [font events specification](http://dev.w3.org/csswg/css-font-load-events/) are currently unimplemented as they would require access to the internal state of the browser.

## Installation

If you are using Bower to manage your dependencies:

    $ bower install fontloader

If you prefer npm:

    $ npm install fontloader

Otherwise copy the [fontloader.js](fontloader.js) file to your project and include it.

## Limitations

The following are limitations due to the fact that this is a JavaScript library without access to a browser's internal state.

#### Metric compatible fonts

Metric compatible fonts are fonts that are designed to have identical metrics to another font so they can be used as a substitute without affecting page layout. When a web font is metric compatible with one of the system fonts (the fonts that are used for `serif`, `sans-serif` and `monospace`) the fontloader can not detect when the web font has loaded.

#### Slow loading fonts

The library has a default timeout of 5 seconds after which it considers a font "load" failed. Unlike the native `fontloader` API this library is not capable of cancelling in-progress font loads so it may happen that the font still loads after the timeout. This is a rare case and usually indicative of a problem with either the font or the host it is loaded from.

#### Unicode Ranges

The polyfill doesn't know the contents of the font, nor does it attempt to read the CSS @font-face `unicode-range`, so it will attempt to load a font even if it doesn't match the Unicode range of the text.

#### fontloader.loading

The `fontloader.loading` boolean is set properly when explicitly loading fonts but doesn't reflect fonts loaded internally by the browser.

## Browser Support

The following browsers are supported:

* IE6+
* Chrome 6+
* Firefox 3.6+
* Safari 3.1+
* Android 2.2+
* iOS 4.2+
* Opera 11+

Other browser may work, but are not extensively tested. Please [open an issue](https://github.com/bramstein/fontloader/issues) if you think a browser should be supported but isn't.

## Copyright and License

Portions of this project are derived from the [Web Font Loader](https://github.com/typekit/webfontloader):

    Web Font Loader Copyright (c) 2010 Adobe Systems Incorporated, Google Incorporated.

The FontLoader polyfill is therefore also licenced under the Apache 2.0 License:

    FontLoader Polyfill Copyright (c) 2013 Bram Stein

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
