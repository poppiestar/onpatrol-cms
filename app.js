
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./models');
var url = require('url');
var Resource = require('express-resource');
var urlHelper = require('./lib/helpers/urlhelper');
var marked = require('marked');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// catch-all for 404s
app.use(function(req, res, next) {
  res.send(404, 'custom 404!!');
});

// REST routes for articles and categories
app.resource('admin/articles', require('./resources/articles'));
app.resource('admin/categories', require('./resources/categories'));

// set default categories
app.set('categories', []);

app.get('*', function(req, res, next) {
  var parsed = urlHelper.parse(req.url);
 
  if( app.get('categories').indexOf(parsed.category) >= 0 ) {
    db.Article.find({ where: { title: parsed.title }})
      .success(function(article) {
        if( article ) {
          res.render('article', {categories: app.get('categories'), article: article, text: marked(article.getDataValue('text'))});
        } else {
          // looking for an article that doesn't exist, 404 it
          next();
        }
      })
      .error(function(err) {
        console.log('error finding article, 404 the sucker');
        next();
      });

  } else { 
    next();
  }
});

db
  .sequelize
  .sync({ force: true })
  .complete(function(err) {
    if (err) {
      throw err;
    } else {
      http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
      });
    }
  });

