goog.provide('fontloader');

goog.require('fontloader.FontFace');
goog.require('fontloader.FontFaceSet');

if (goog.DEBUG || !window['FontFace']) {
  window['FontFace'] = fontloader.FontFace;
  window['FontFace']['prototype']['load'] = fontloader.FontFace.prototype.load;
  window.document['fonts'] = new fontloader.FontFaceSet();
}
