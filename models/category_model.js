module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  });

  return Category;
}

