module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'games',
    serializer: 'game',
    home_team: function () {
      return this.belongsTo('Team', 'home_team_id');
    },
    away_team: function () {
      return this.belongsTo('Team', 'away_team_id');
    },
    picks: function () {
      return this.hasMany('Pick');
    }
  });
};
