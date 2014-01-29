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
  res.render('categories/edit', {
    category: category,
    errors: {},
    create: true
  });
};

// POST /categories
exports.create = function(req, res) {
  var category = Category.build({
    name: req.body.category.name,
    visible: !!req.body.category.visible
  });

  category.save()
    .error(function(errors) {
      res.render('categories/edit', {
        create: true,
        errors: errors,
        category: category
      });
    })
    .success(function(category) {
      Article.create({
        title: 'root',
        text: 'This is the default article for category ' + category.name,
        CategoryId: category.id
      })
      .success(function(article) {
        // rebuild the category cache
        Category.findAll()
          .success(function(categories) {
            req.app.set('categories', categories);
            res.redirect('/admin/categories');
          });
      });
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
        // rebuild the category cache
        Category.findAll()
          .success(function(categories) {
            req.app.set('categories', categories);
            res.redirect('/admin/categories/' + category.id);
          });
      });
    })
    .error(function(error) {
      console.log('something messed up finding category: ', error);
      res.send(500, '500 something messed up: ' + error);
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

