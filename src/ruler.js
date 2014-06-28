goog.provide('fontloader.Ruler');

goog.scope(function () {
  /**
   * @constructor
   * @param {string} text
   */
  fontloader.Ruler = function (text) {
    this.el = goog.global.document.createElement('span');
    this.el.setAttribute('aria-hidden', 'true');
    this.el.appendChild(goog.global.document.createTextNode(text));
  };

  var Ruler = fontloader.Ruler;

  /**
   * Insert the ruler into the DOM
   */
  Ruler.prototype.insert = function () {
    goog.global.document.body.appendChild(this.el);
  };

  /**
   * Remove the ruler from the DOM
   */
  Ruler.prototype.remove = function () {
    goog.global.document.body.removeChild(this.el);
  };

  /**
   * @return {number} The width of this ruler
   */
  Ruler.prototype.getWidth = function () {
    return this.el.offsetWidth;
  };

  /**
   * @param {string} style
   */
  Ruler.prototype.setStyle = function (style) {
    this.el.style.cssText = 'visibility:hidden;position:absolute;width:auto;margin:0;padding:0;top:0;white-space:nowrap;font-size:300px;' + style;
  };
});
