var Article = require('../models').Article;
var Category = require('../models').Category;
var marked = require('marked');
var _ = require('lodash');

// GET /articles
exports.index = function(req, res) {
  Article.findAll({
      include: [{ model: Category }] 
    }).success(function(articles) {
    switch (req.format) {
      case 'json':
        res.send(articles);
        break;

      default:
        res.render('articles/index', {
          articles: articles
        });
        break;
    }
  });
};

// GET /articles/new
exports.new = function(req, res) {
  if ( req.app.get('categories').length === 0 ) {
    res.redirect('/admin/categories');
  } else {
    var category = _.find(req.app.get('categories'), function(category) {
      return category.id === parseInt(req.query.category, 10);
    });

    res.render('articles/edit', {
      create: true,
      article: {},
      categories: req.app.get('categories'),
      category: category
    });
  }
};

// POST /articles
exports.create = function(req, res) {
  Article.create({
    title: req.body.article.title,
    text: req.body.article.text
  })
  .success(function(article) {
    Category.find({
        where: { id: req.body.article.category }
      })
      .success(function(category) {
        article.setCategory(category)
          .complete(function(err) {
            res.redirect('/admin/articles/' + article.getDataValue('id'));
          });
      });
  });
};

// GET /articles/:id
exports.show = function(req, res) {
  Article.find({
      where: { id: req.params.article },
      include: [{ model: Category }]
    })
    .success(function(article) {
      switch( req.format ) {
        case 'json':
          res.send(article);
          break;

       default:
         res.render('articles/show', {
           article: article,
           text: marked(article.getDataValue('text'))
         });
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
  Category.findAll()
    .success(function(categories) {
      Article.find({ 
        where: { id: req.params.article }
      })
      .success(function(article) {
        res.render('articles/edit', { categories: categories, article: article });
      })
      .error(function(error) {
        console.log('something messed up editing: ', error);
        res.send('something messed up: ' + error);
      });
  });
};

// PUT /articles/:id
exports.update = function(req, res) {
  Article.find({
      where: { id: req.params.article }
    })
    .success(function(article) {
      // update article instance
      article.updateAttributes({
        title: req.body.article.title,
        text: req.body.article.text
      })
      .success(function() {
        Category.find({
            where: { id: req.body.article.category }
          })
          .success(function(category) {
            article.setCategory(category)
              .complete(function(err) {
                res.redirect('/admin/articles/' + article.id);
              });
          });
      });
    });
};

// DELETE /articles/:id
exports.destroy = function(req, res) {
  Article.find({
      where: { id: req.params.article },
      include: [{ model: Category }]
    })
    .success(function(article) {
      if (article.getDataValue('title') === 'root') {
        // can't delete a root article
        res.send('cannot delete root article');
      } else {
        article.destroy()
          .success(function() {
            if (article.category) {
              res.redirect('/admin/categories/'+article.category.getDataValue('id'));
            } else {
              res.redirect('/admin/articles');
            }
          });
      }
    });
};

