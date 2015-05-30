module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'weeks',
    games: function () {
      return this.hasMany('Game');
    },
    serialize: function (request) {
      return {
        id: this.get('id'),
        name: this.get('name'),
        open_date: this.get('open_date'),
        close_date: this.get('close_date'),
        games: this.related('games').map(function (game) {
          return game.serialize(request);
        }),
        created_at: this.get('created_at'),
        updated_at: this.get('updated_at'),
        object: 'week'
      };
    }
  });
};
