module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define('Article', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    text: DataTypes.TEXT,
    publishedAt: {
      type: DataTypes.DATE,
    },
    state: DataTypes.STRING
  }, {
    instanceMethods: {
      getTitle: function() {
        return ( this.title === 'root' ? '' : '/' + this.title );
      }
    }
  });

  return Article;
}

