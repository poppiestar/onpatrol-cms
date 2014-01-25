module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define('Article', {
    title: DataTypes.STRING,
    text: DataTypes.TEXT,
    publishedAt: DataTypes.DATE,
    state: DataTypes.STRING
  });

  return Article;
}

