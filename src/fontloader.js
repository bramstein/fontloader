goog.provide('fontloader');

goog.require('fontloader.FontFace');

if (goog.DEBUG || !window['FontFace']) {
  window['FontFace'] = fontloader.FontFace;
  window['FontFace']['prototype']['load'] = fontloader.FontFace.prototype.load;
}
