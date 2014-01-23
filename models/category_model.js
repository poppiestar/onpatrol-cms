module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    navIncluded: DataTypes.BOOLEAN
  });

  return Category;
}

