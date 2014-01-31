module.exports = function(sequelize, DataTypes) {

  var ArticleStates = ['draft', 'published', 'withdrawn'];
  var NewArticleStates = ['draft', 'published'];
  var PublishedArticleStates = ['published', 'withdrawn'];

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
      defaultValue: 'draft',
      validate: {
        isIn: [ArticleStates]
      }
    }
  }, {
    instanceMethods: {
      getTitle: function() {
        return ( this.title === 'root' ? '' : '/' + this.title );
      },
      getStates: function() {
        if( this.state === 'draft' ) {
          return NewArticleStates;
        } else {
          return PublishedArticleStates;
        }
      }
    }
  });

  return Article;
}

