module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'weeks',
    games: function () {
      return this.hasMany('Game');
    }
  });
};
