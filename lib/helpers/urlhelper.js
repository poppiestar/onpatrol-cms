exports.parse = function(url) {
  var urlObject = { title: 'root', category: 'root' },
      url = url.substring(1), // remove leading slash
      splitUrl;

  // text before a / character is the category
  if ( url !== '' ) {
    if ( url.indexOf('/') >= 0 ) {
      splitUrl = url.split('/');

      urlObject.category = splitUrl[0];
      if( splitUrl[1] !== '' ) {
        urlObject.title    = splitUrl[1];
      }
    } else {
      urlObject.category = url;
    }
  }

  return urlObject;
};

