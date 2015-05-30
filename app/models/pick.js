module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'picks',
    game: function () {
      return this.belongsTo('Game');
    },
    winning_team: function () {
      return this.belongsTo('Team', 'winning_team_id');
    },
    losing_team: function () {
      return this.belongsTo('Team', 'losing_team_id');
    },
    user: function () {
      return this.belongsTo('User');
    },
    serialize: function (request) {
      return {
        id: this.get('id'),
        game: this.related('game').serialize(request),
        winning_team: this.related('winning_team').serialize(request),
        losing_team: this.related('losing_team').serialize(request),
        best_bet: this.get('best_bet'),
        created_at: this.get('created_at'),
        updated_at: this.get('updated_at'),
        object: 'pick'
      };
    }
  });
};
