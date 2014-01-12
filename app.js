
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./models');
var url = require('url');
var Resource = require('express-resource');

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

// REST routes for articles
app.resource('articles', require('./resources/articles'));
app.resource('categories', require('./resources/categories'));

app.get('*', function(req, res, next) {
  var parsed = url.parse(req.url);
  var chopped = req.url.substring(1);
 
  if( app.settings.categories.indexOf(chopped) >= 0 ) {
    res.send('found category, here is a page!');
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

