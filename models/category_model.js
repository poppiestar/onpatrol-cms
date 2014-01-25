module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });

  return Category;
}

