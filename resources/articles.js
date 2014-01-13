var db = require('../models');
var marked = require('marked');

// GET /articles
exports.index = function(req, res) {
  db.Article.findAll().success(function(articles) {
    res.render('articles/index', { articles: articles });
  });
};

// GET /articles/new
exports.new = function(req, res) {
  res.render('articles/new');
};

// POST /articles
exports.create = function(req, res) {
  db.Article.create({ title: req.body.article_title, text: req.body.article_text })
    .success(function(article) {
      res.redirect('/articles/' + article.getDataValue('id'));
    })
    .error(function(error) {
      console.log('something fucked up creating: ', error);
      res.send('something fucked up: ' + error);
    });
};

// GET /articles/:id
exports.show = function(req, res) {
  db.Article.find({ where: { id: req.params.article } })
    .success(function(article) {
      res.render('articles/show', { article: article, text: marked(article.getDataValue('text'))});
    })
    .error(function(error) {
      console.log('something fucked up showing: ', error);
      res.send('something fucked up: ' + error);
    });
};

// GET /articles/:id/edit
exports.edit = function(req, res) {
  res.send('EDIT WOO!');
};

// PUT /articles/:id
exports.update = function(req, res) {
  res.send('UPDATE WOO!');
};

// DELETE /articles/:id
exports.destroy= function(req, res) {
  res.send('DELETE WOO!');
};

