module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.createTable(
      'articles',
      {
        'title' : DataTypes.STRING,
        'text'  : DataTypes.TEXT,
        'publishedAt' : DataTypes.DATE,
        'state' : DataTypes.STRING
      }
    );

    done();
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.dropTable('articles');
    done();
  }
}
