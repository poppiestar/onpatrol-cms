var Category = require('../models').Category;
var Article = require('../models').Article;

// GET /categories
exports.index = function(req, res) {
  Category.findAll({ include: [{model: Article}]}).success(function(categories) {
    res.render('categories/index', { categories: categories });
  });
};

// GET /categories/new
exports.new = function(req, res) {
  var category = Category.build();
  res.render('categories/edit', { category: category, create: true});
};

// POST /categories
exports.create = function(req, res) {
  Category.create({
    name: req.body.category.name,
    visible: !!req.body.category.visible
  })
  .success(function(category) {
    Category.findAll()
      .success(function(categories) {
        // update the categories cache
        req.app.set('categories', categories);

        // create a default root article for the new category
        Article.create({
          title: 'root',
          text: 'This is a default article for this category'
        })
        .success(function(article) {
          article.setCategory(category)
            .complete(function(err) {
              res.redirect('/admin/categories');
            });
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
  Category.find({ where: { id: req.params.category }, include: [{ model: Article }] })
    .success(function(category) {
      if( category ) {
        res.render('categories/show', { category: category });
      } else {
        res.redirect('/admin/categories');
      }
    })
    .error(function(error) {
      console.log('something broke showing: ', error);
      res.send('something broke: ' + error);
    });
};

// GET /categories/:id/edit
exports.edit = function(req, res) {
  Category.find({ where: { id: req.params.category } })
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
  Category.find({ where: { id: req.params.category } })
    .success(function(category) {
      category.updateAttributes({
        name: req.body.category.name,
        visible: !!req.body.category.visible
      })
      .success(function() {
        Category.findAll()
          .success(function(categories) {
            // update the category cache
            req.app.set('categories', categories);

            res.redirect('/admin/categories/' + category.id);
          });
      });
    })
    .error(function(error) {
      console.log('something messed up updating: ', error);
      res.send('something messed up: ' + error);
    });
};

// DELETE /categories/:id
exports.destroy = function(req, res) {
  Category.find({ where: { id: req.params.category }, include: [{ model: Article }] })
    .success(function(category) {
      // can only delete a category if it has one article (which will be root)
      if ( category.articles.length === 1 ) {
        category.destroy()
          .success(function() {
            Category.findAll()
              .success(function(categories) {
                // update the category cache
                req.app.set('categories', categories);

                res.redirect('/admin/categories');
              });
          });
      } else {
        res.redirect('/admin/categories/'+category.getDataValue('id'));
      }
  });
};

