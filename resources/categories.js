var db = require('../models');

// GET /categories
exports.index = function(req, res) {
  db.Category.findAll().success(function(categories) {
    res.render('categories/index', { categories: categories });
  });
};

// GET /categories/new
exports.new = function(req, res) {
  res.render('categories/new');
};

// POST /categories
exports.create = function(req, res) {
  db.Category.create({ name: req.body.name })
    .success(function(category) {
      db.Category.findAll()
        .success(function(categories) {
          var names = categories.map(function(category) { return category.name; });
          req.app.set('categories', names);

          // create a default root article for the new category
          db.Article.create({ title: 'root', text: 'This is a default article for this category' })
            .success(function(article) {
              article.setCategory(category);
              res.redirect('/categories/' + category.getDataValue('id'));
            })
            .error(function(error) {
              console.log(error);
              res.send('There was an error creating the default article');
            });
        });
    })
    .error(function(error) {
      console.log('something broke creating: ', error);
      res.send('something broke: ' + error);
    });
};

// GET /categories/:id
exports.show = function(req, res) {
  db.Category.find({ where: { id: req.params.category }, include: [{model:db.Article}] })
    .success(function(category) {
      if( category ) {
        res.render('categories/show', { category: category });
      } else {
        res.redirect('/categories');
      }
    })
    .error(function(error) {
      console.log('something broke showing: ', error);
      res.send('something broke: ' + error);
    });
};

// GET /categories/:id/edit
exports.edit = function(req, res) {
  db.Category.find({ where: { id: req.params.category } })
    .success(function(category) {
      res.render('categories/edit', { category: category });
    })
    .error(function(error) {
      console.log('something messed up editing: ', error);
      res.send('something messed up: ' + error);
    });
};

// PUT /categories/:id
exports.update = function(req, res) {
  db.Category.find({ where: { id: req.params.category } })
    .success(function(category) {
      category.updateAttributes({
        name: req.body.name
      })
      .success(function() {
        res.redirect('/categories/' + category.id);
      });
    })
    .error(function(error) {
      console.log('something messed up updating: ', error);
      res.send('something messed up: ' + error);
    });
};

// DELETE /categories/:id
exports.destroy = function(req, res) {
  db.Category.find({ where: { id: req.params.category } })
    .success(function(category) {
      category.getArticles()
        .success(function(articles) {
          // can only delete a category if it has one article (which will be root)
          if ( articles.length === 1 ) {
            category.destroy()
              .success(function() {
                res.redirect('/categories');
              });
          } else {
            res.redirect('/categories/'+category.getDataValue('id'));
          } 
        });
    });
};

