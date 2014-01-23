var db = require('../models');
var marked = require('marked');

// GET /articles
exports.index = function(req, res) {
  db.Article.findAll().success(function(articles) {
    switch (req.format) {
      case 'json':
        res.send(articles);
        break;

      default:
        res.render('articles/index', { articles: articles });
        break;
    }
  });
};

// GET /articles/new
exports.new = function(req, res) {
  db.Category.findAll()
    .success(function(categories) {
      res.render('articles/new', { categories: categories });
    });
};

// POST /articles
exports.create = function(req, res) {
  db.Category.find({ where: { id: req.body.article_category } })
    .success(function(category) {
      db.Article.create({ title: req.body.article_title, text: req.body.article_text })
        .success(function(article) {
          article.setCategory(category);
          res.redirect('/articles/' + article.getDataValue('id'));
        })
        .error(function(error) {
          console.log('something messed up creating: ', error);
          res.send('something messed up: ' + error);
        });
    });
};

// GET /articles/:id
exports.show = function(req, res) {
  db.Article.find({ where: { id: req.params.article }, include: [{ model: db.Category }] })
    .success(function(article) {
      switch( req.format ) {
        case 'json':
          res.send(article);
          break;

       default:
         res.render('articles/show', { article: article, text: marked(article.getDataValue('text'))});
         break;
      }
    })
    .error(function(error) {
      console.log('something messed up showing: ', error);
      res.send('something messed up: ' + error);
    });
};

// GET /articles/:id/edit
exports.edit = function(req, res) {
  db.Article.find({ where: { id: req.params.article } })
    .success(function(article) {
      res.render('articles/edit', { article: article });
    })
    .error(function(error) {
      console.log('something messed up editing: ', error);
      res.send('something messed up: ' + error);
    });
};

// PUT /articles/:id
exports.update = function(req, res) {
  db.Article.find({ where: { id: req.params.article} })
    .success(function(article) {
      article.updateAttributes({
        title: req.body.title,
        text: req.body.text
      })
      .success(function() {
        res.redirect('/articles/' + article.id);
      });
    })
    .error(function(error) {
      console.log('something messed up updating: ', error);
      res.send('something messed up: ' + error);
    });
};

// DELETE /articles/:id
exports.destroy = function(req, res) {
  db.Article.find({ where: { id: req.params.article } })
    .success(function(article) {
      article.getCategory()
        .success(function(category) {
          if (article.getDataValue('title') === 'root') {
            // can't delete a root article
            res.send('cannot delete root article');
          } else {
            article.destroy()
              .success(function() {
                if (category) {
                  res.redirect('/categories/'+category.getDataValue('id'));
                } else {
                  res.redirect('/articles');
                }
              });
          }
        });
    });
};

