module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'picks',
    winning_team: function () {
      return this.belongsTo('Team', 'winning_team_id');
    },
    losing_team: function () {
      return this.belongsTo('Team', 'losing_team_id');
    },
    user: function () {
      return this.belongsTo('User');
    }
  });
};