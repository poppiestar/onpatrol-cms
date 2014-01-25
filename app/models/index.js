var fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  lodash = require('lodash'),
  sequelize = new Sequelize('onpatrol_development', 'testuser', 'test', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  }),
  db = {};

  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach(function(file) {
      var model = sequelize.import(path.join(__dirname, file));

      db[model.name] = model;
    })

    Object.keys(db).forEach(function(modelName) {
      if (db[modelName].options.hasOwnProperty('associate')) {
        db[modelName].options.associate(db);
      }
    });

    db.Category.hasMany(db.Article);
    db.Article.belongsTo(db.Category);

    module.exports = lodash.extend({
      sequelize: sequelize,
      Sequelize: Sequelize
    }, db);

