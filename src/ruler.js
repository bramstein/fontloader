goog.provide('fontloader.Ruler');

goog.require('fontloader.util');
goog.require('fontloader.CSSValue');

goog.scope(function () {
  var util = fontloader.util,
      CSSValue = fontloader.CSSValue;

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
   * @const
   * @enum {string}
   */
  Ruler.STYLES = {
    'visibility': 'hidden',
    'position': 'absolute',
    'width': 'auto',
    'margin': '0',
    'padding': '0',
    'top': '0',
    'left': '0',
    'white-space': 'nowrap',
    'font-size': '300px'
  };

  /**
   * Insert the ruler into the DOM
   *
   * @return {fontloader.Ruler}
   */
  Ruler.prototype.insert = function () {
    goog.global.document.body.appendChild(this.el);
    return this;
  };

  /**
   * Remove the ruler from the DOM
   *
   * @return {fontloader.Ruler}
   */
  Ruler.prototype.remove = function () {
    goog.global.document.body.removeChild(this.el);
    return this;
  };

  /**
   * @return {number} The width of this ruler
   */
  Ruler.prototype.getWidth = function () {
    return this.el.offsetWidth;
  };

  /**
   * @param {fontloader.CSSValue} style
   *
   * @return {fontloader.Ruler}
   */
  Ruler.prototype.setStyle = function (style) {
    var styles = util.extend({}, style, Ruler.STYLES);

    this.el.style.cssText = CSSValue.serialize(styles, true);
    return this;
  };
});
