window.loadStylesheet = function (href) {
  var link = document.createElement('link');

  link.rel = 'stylesheet';
  link.href = href;

  document.getElementsByTagName('head')[0].appendChild(link);

  return link;
};
