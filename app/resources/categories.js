var Category = require('../models').Category;
var Article = require('../models').Article;

// GET /categories
exports.index = function(req, res) {
  Category.findAll({
    include: [{ model: Article }]
  })
  .success(function(categories) {
    res.render('categories/index', {
      categories: categories
    });
  });
};

// GET /categories/new
exports.new = function(req, res) {
  var category;

  if( req.session.category ) {
    category = req.session.category;
    delete req.session.category;
  } else {
    category = Category.build();
  }

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
    visible: !!req.body.category.visible,
    active: !!req.body.category.active
  });

  category.save()
  .error(function(errors) {
    // there was an error saving, redirect to the edit form with a warning
    req.session.category = category;
    req.flash('alert', 'There was a problem while trying to save your category');
    req.flash('alert_text', 'danger');
    res.redirect('/admin/categories/new');
  })
  .success(function(category) {
    Article.create({
      title: 'root',
      text: 'This is the default article for category ' + category.name,
      CategoryId: category.id
    })
    .error(function(error) {
      // couldn't create category default article, redirect to category with warning
      req.flash('alert', 'The default article for category \'' + category.name + '\' could not be created');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/categories/' + category.id);
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
  Category.find({
    where: { id: parseInt(req.params.category, 10) },
    include: [{ model: Article }]
  })
  .error(function(error) {
    // redirect back to categories index with warning
    req.flash('alert', 'The requested category could not be found');
    req.flash('alert_type', 'warning');
    res.redirect('/admin/categories');
  })
  .success(function(category) {
    if( !category ) {
      // redirect back to categories index with warning
      req.flash('alert', 'The requested category could not be found');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/categories');
    } else {
      res.render('categories/show', { category: category });
    }
  });
};

// GET /categories/:id/edit
exports.edit = function(req, res) {
  Category.find({
    where: { id: parseInt(req.params.category, 10) }
  })
  .error(function(error) {
    // redirect back to categories index with warning
    req.flash('alert', 'The requested category could not be found');
    req.flash('alert_type', 'warning');
    res.redirect('/admin/categories');
  })
  .success(function(category) {
    if( !category ) {
      // redirect back to categories index with warning
      req.flash('alert', 'The requested category could not be found');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/categories');
    } else {
      res.render('categories/edit', {
        category: category,
        errors: {}
      });
    }
  });
};

// PUT /categories/:id
exports.update = function(req, res) {
  Category.find({
    where: { id: parseInt(req.params.category, 10) }
  })
  .error(function(error) {
    // redirect back to categories index with warning
    req.flash('alert', 'The requested category could not be found');
    req.flash('alert_type', 'warning');
    res.redirect('/admin/categories');
  })
  .success(function(category) {
    if( !category ) {
      // redirect back to categories index with warning
      req.flash('alert', 'The requested category could not be found');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/categories');
    } else {
      category.updateAttributes({
        name: req.body.category.name,
        visible: !!req.body.category.visible,
        active: !!req.body.category.active
      })
      .success(function() {
        // rebuild the category cache
        Category.findAll()
        .success(function(categories) {
          req.app.set('categories', categories);
          res.redirect('/admin/categories/' + category.id);
        });
      });
    }
  });
};

// DELETE /categories/:id
exports.destroy = function(req, res) {
  Category.find({
    where: { id: parseInt(req.params.category, 10) },
    include: [{ model: Article }]
  })
  .error(function(error) {
    // redirect back to categories index with warning
    req.flash('alert', 'The requested category could not be found');
    req.flash('alert_type', 'warning');
    res.redirect('/admin/categories');
  })
  .success(function(category) {
    if( !category ) {
      // redirect back to categories index with warning
      req.flash('alert', 'The requested category could not be found');
      req.flash('alert_type', 'warning');
      res.redirect('/admin/categories');
    } else {
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
    }
  });
};

