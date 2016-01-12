# Deprecated

This library is deprecated and no longer maintained. The CSS font loading API is near impossible to implement without access to the browser's internal font loading behaviour. The most useful aspects of the API (font events) has been implemented in [Font Face Observer](https://github.com/bramstein/fontfaceobserver), so please use that instead.

## FontLoader Polyfill [![Build Status](https://travis-ci.org/bramstein/fontloader.png?branch=master)](https://travis-ci.org/bramstein/fontloader)

This polyfill implements the [W3C Font Load Events Module Level 3 specification](http://www.w3.org/TR/css-font-loading/). It detects when fonts have loaded and provides callbacks for each font load event. You can use the fontloader polyfill to prevent the Flash Of Unstyled Text (FOUT) or execute JavaScript code when fonts have loaded (for example to perform layout or show a user interface element.)

## API


## Installation

If you using npm:

    $ npm install fontloader

Otherwise copy the [fontloader.js](fontloader.js) file to your project and include it.

## Limitations

The following are limitations due to the fact that this is a JavaScript library without access to a browser's internal state.

#### Metric compatible fonts

Metric compatible fonts are fonts that are designed to have identical metrics to another font so they can be used as a substitute without affecting page layout. When a web font is metric compatible with one of the system fonts (the fonts that are used for `serif`, `sans-serif` and `monospace`) the fontloader can not detect when the web font has loaded.

#### Slow loading fonts

The library has a default timeout of 3 seconds after which it considers a font "load" failed. Unlike the native API this library is not capable of cancelling in-progress font loads so it may happen that the font still loads after the timeout. This is a rare case and usually indicative of a problem with either the font or the host it is loaded from.

## Browser Support

The following browsers are supported:

* IE9+
* Chrome
* Firefox
* Safari
* Android
* iOS
* Opera

Other browser may work, but are not extensively tested. Please [open an issue](https://github.com/bramstein/fontloader/issues) if you think a browser should be supported but isn't. Tests are run automatically on all supported browsers using [BrowserStack](http://www.browserstack.com) and [browserstack-test](https://github.com/bramstein/browserstack-test).

## Copyright and License

Portions of this project are derived from the [Web Font Loader](https://github.com/typekit/webfontloader):

    Web Font Loader Copyright (c) 2010 Adobe Systems Incorporated, Google Incorporated.

The FontLoader polyfill is therefore also licenced under the Apache 2.0 License:

    FontLoader Polyfill Copyright (c) 2013-2014 Bram Stein

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
