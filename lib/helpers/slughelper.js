exports.parse = function(slug) {
  var slugObject = { title: '', category: '' },
      splitSlug;

  // text before a / character is the category
  if ( slug.indexOf('/') >= 0 ) {
    splitSlug = slug.split('/');

    slugObject.category = splitSlug[0];
    slugObject.title    = splitSlug[1];
  } else {
    slugObject.title = slug;
  }

  return slugObject;
};

