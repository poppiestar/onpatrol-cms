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
      res.redirect('/categories/' + category.getDataValue('id'));
    })
    .error(function(error) {
      console.log('something fucked up creating: ', error);
      res.send('something fucked up: ' + error);
    });
};

// GET /categories/:id
exports.show = function(req, res) {
  db.Category.find({ where: { id: req.params.category } })
    .success(function(category) {
      res.render('categories/show', { category: category });
    })
    .error(function(error) {
      console.log('something fucked up showing: ', error);
      res.send('something fucked up: ' + error);
    });
};

// GET /categories/:id/edit
exports.edit = function(req, res) {
  res.send('EDIT WOO!');
};

// PUT /categories/:id
exports.update = function(req, res) {
  res.send('UPDATE WOO!');
};

// DELETE /categories/:id
exports.destroy = function(req, res) {
  res.send('DELETE WOO!');
};

