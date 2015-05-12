goog.provide('fontloader');

goog.require('fl.FontFace');
goog.require('fl.FontFaceSet');

if (!window['FontFace']) {
  window['FontFace'] = fl.FontFace;
  window['FontFace']['prototype']['load'] = fl.FontFace.prototype.load;

  document['fonts'] = new fl.FontFaceSet();
}
