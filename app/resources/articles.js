var Article = require('../models').Article;
var Category = require('../models').Category;
var marked = require('marked');
var _ = require('lodash');

// GET /articles
exports.index = function(req, res) {
  Article.findAll({
    include: [{ model: Category }] 
  })
  .success(function(articles) {
    switch (req.format) {
      case 'json':
        res.send(articles);
        break;

      case 'html':
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
  var article;
  var errors;

  if ( req.session.article ) {
    article = req.session.article;
    delete req.session.article;
  } else {
    article = Article.build();
  }
  
  if( req.session.errors ) {
    errors = req.session.errors;
    delete req.session.errors;
  } else {
    errors = {};
  }

  if ( req.app.get('categories').length === 0 ) {
    // no categories exist, redirect to the category index with a warning
    req.flash('alert', 'A category must exist before an article can be created');
    req.flash('alert_type', 'warning');
    res.redirect('/admin/categories');
  } else {
    res.render('articles/edit', {
      create: true,
      article: article,
      categories: _.filter(req.app.get('categories'), function(category) {
        return category.name !== 'root';
      }),
      category: _.find(req.app.get('categories'), function(category) {
        return category.id === parseInt(req.query.category, 10);
      }),
      errors: errors
    });
  }
};

// POST /articles
exports.create = function(req, res) {
  var article = Article.build({
    title: req.body.article.title,
    text: req.body.article.text,
    state: req.body.artcle.state
  });

  Category.find({
    where: { id: parseInt(req.body.article.category, 10) }
  })
  .error(function(errors) {
    // unable to find category, redirect back to edit page with errors
    req.session.article = article;
    req.session.errors = { category: 'The selected category does not exist' };
    res.redirect('/admin/articles/new');
  })
  .success(function(category) {
    if( !category ) {
      // unable to find category, redirect back to edit page with errors
      req.session.article = article;
      req.session.errors = { category: 'The selected category does not exist' };
      res.redirect('/admin/articles/new');
    } else {
      article.CategoryId = category.getDataValue('id');
      article.save()
      .error(function(errors) {
        // error saving article, redirect back to edit page with danger alert
        req.flash('alert', {
          type: 'danger',
          text: 'There was a problem saving your article'
        });
        req.session.article = article;
        res.redirect('/admin/articles/new');
      })
      .success(function(article) {
        req.flash('alert', 'Article was created successfully');
        req.flash('alert_type', 'success');
        res.redirect('/admin/articles/' + article.getDataValue('id'));
      });
    }
  });
};

// GET /articles/:id
exports.show = function(req, res) {
  Article.find({
      where: { id: req.params.article },
      include: [{ model: Category }]
    })
    .error(function(error) {
      res.send(500, '500 There was a major problem trying to load your article');
    })
    .success(function(article) {
      switch( req.format ) {
        case 'json':
          if( !article ) {
            res.send(404, { error: 'Unable to find article' });
          } else {
            res.send(article);
          }
          break;

        case 'html':
        default:
          if( !article ) {
            req.flash('alert', 'The requested article could not be found');
            req.flash('alert_type', 'warning');
            res.redirect('/admin/articles');
          } else {
            res.render('articles/show', {
              article: article,
              text: marked(article.getDataValue('text'))
            });
          }
          break;
      }
    });
};

// GET /articles/:id/edit
exports.edit = function(req, res) {
  Article.find({ 
    where: { id: req.params.article },
    include: [{ model: Category }]
  })
  .error(function(error) {
    res.send(500, '500 There was a major problem trying to load your article');
  })
  .success(function(article) {
    if( !article ) {
      // article doesn't exist, redirect back to articles index with warning
      req.flash('alert', 'The requested article could not be found');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/articles');
    } else {
      res.render('articles/edit', {
        categories: _.filter(req.app.get('categories'), function(category) {
          return category.name !== 'root';
        }),
        category: _.find(req.app.get('categories'), function(category) {
          return category.id === article.category.id;
        }),
        article: article,
        errors: {}
      });
    }
  });
};

// PUT /articles/:id
exports.update = function(req, res) {
  Article.find({
      where: { id: req.params.article },
      include: [{ model: Category }]
    })
    .error(function(error) {
      res.send(500, '500 There was a severe problem updating your article');
    })
    .success(function(article) {
      if( !article ) {
        // redirect back to index page with a warning
        req.flash('alert', 'The requested article could not be found');
        req.flash('alert_type', 'warning');
        res.redirect('/admin/articles');
      } else {
        var rootArticle = article.title === 'root' ? true : false;

        // update article instance
        article.updateAttributes({
          title: req.body.article.title,
          text: req.body.article.text,
          state: req.body.article.state,
          CategoryId: parseInt(req.body.article.category, 10)
        })
        .success(function() {
          if( rootArticle && article.title !== 'root' ) {
            // article is no longer category root article, set category inactive
            Category.find({
              where: { id: article.category.id }
            })
            .success(function(category) {
              category.updateAttributes({
                active: false
              })
              .success(function() {
                req.flash('alert', 'Category \'' + article.category.name + '\' no longer has a root article, it has been set inactive');
                req.flash('alert_type', 'warning');
                res.redirect('/admin/articles/' + article.id);
              });
            });
          }
        });
      }
    });
};

// DELETE /articles/:id
exports.destroy = function(req, res) {
  Article.find({
    where: { id: req.params.article },
    include: [{ model: Category }]
  })
  .error(function(error) {
    res.send(500, '500 There was a severe problem deleting your article');
  })
  .success(function(article) {
    if( !article ) {
      // redirect back to index page with a warning
      req.flash('alert', 'Article could not be found');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/articles');
    } else {
      if (article.getDataValue('title') === 'root') {
        // can't delete a root article
        req.flash('alert', 'Cannot delete a category root article');
        req.flash('alert_type', 'warning');
        res.redirect('/admin/articles');
      } else {
        article.destroy()
        .error(function(errors) {
        })
        .success(function() {
          if (article.category) {
            res.redirect('/admin/categories/'+article.category.getDataValue('id'));
          } else {
            res.redirect('/admin/articles');
          }
        });
      }
    }
  });
};

