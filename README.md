## FontLoader Polyfill


## Limitations

The following are limitations due to the fact that this is a JavaScript library without access to the browser internals.

#### Metric compatible fonts

Metric compatible fonts are fonts that are designed to have identical metrics to another font so they can be used as a substitute without affecting page layout. 

#### System fonts

This library can be used to detect the loading or availability of certain system fonts. However it is unable to detect the default fallback fonts (e.g. the fonts that are used when you specify `serif`, `sans-serif` and `monospace`.

#### Slow loading fonts

The library has a default timeout of X seconds after which it considers a font load failed. Unlike the native `fontloader` API this library is not capable of cancelling in-progress font loads so it may happen that the font still loads after the timeout. This is a rare case and usually indicative of a problem with either the font or the host it is loaded from.

#### Unicode Ranges

The polyfill doesn't know the contents of the font so it will attempt to load a font even if it doesn't match the Unicode range of the text.

## Browser Support

The following browsers are supported:

* IE6+
* Chrome 6+
* Firefox 3.6+
* Safari 3.1+
* Android 2.2+
* iOS 4.2+
* Opera 11+

Other browser may work, but are not extensively tested. Please open an issue if you think a browser should be supported but isn't.

## Copyright and License

Portions of this project are derived from the [Web Font Loader](https://github.com/typekit/webfontloader):

    Web Font Loader Copyright (c) 2010 Adobe Systems Incorporated, Google Incorporated.

The FontLoader polyfill is therefore also licenced under the Apache 2.0 License:

    FontLoader Polyfill Copyright (c) 2013 Bram Stein

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
