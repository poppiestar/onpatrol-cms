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
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft'
    }
  }, {
    instanceMethods: {
      getTitle: function() {
        return ( this.title === 'root' ? '' : '/' + this.title );
      }
    }
  });

  return Article;
}

