
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./app/models');
var url = require('url');
var Resource = require('express-resource');
var urlHelper = require('./lib/helpers/urlhelper');
var marked = require('marked');
var _ = require('lodash');
var SequelizeStore = require ('connect-session-sequelize')(express);
var flash = require('express-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.cookieParser());
app.use(express.session({
  store: new SequelizeStore({ db: db.sequelize }),
  secret: 's3kr1t'
}));
app.use(flash());
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
app.resource('admin/articles', require('./app/resources/articles'));
app.resource('admin/categories', require('./app/resources/categories'));

app.get('*', function(req, res, next) {
  var parsed = urlHelper.parse(req.url);
  var category = _.find(app.get('categories'), function(category) {
    return category.active && category.name === parsed.category;
  });
  var categories = _.filter(app.get('categories'), function(category) {
    return category.active && category.visible;
  });

  if( category ) {
    db.Article.find({
      where: { title: parsed.title, state: 'published' },
      include: [{ model: db.Category, where: { id: category.id } }] })
      .success(function(article) {
        if( article ) {
          res.render('article', {
            categories: categories,
            article: article,
            text: marked(article.getDataValue('text'))
          });
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
      // grab all the categories from the db before starting
      db.Category.findAll()
        .success(function(categories) {
          app.set('categories', categories);

          // start server
          http.createServer(app).listen(app.get('port'), function(){
            console.log('Express server listening on port ' + app.get('port'));
          });
        });
    }
  });

