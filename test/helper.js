window.loadStylesheet = function (href) {
  var link = document.createElement('link');

  link.rel = 'stylesheet';
  link.href = href;

  document.head.appendChild(link);

  return link;
};
