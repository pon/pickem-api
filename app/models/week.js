module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'weeks',
    serializer: 'week',
    games: function () {
      return this.hasMany('Game');
    }
  });
};
