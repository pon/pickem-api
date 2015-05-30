module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'games',
    home_team: function () {
      return this.belongsTo('Team', 'home_team_id');
    },
    away_team: function () {
      return this.belongsTo('Team', 'away_team_id');
    },
    picks: function () {
      return this.hasMany('Pick');
    },
    serialize: function (request) {
      return {
        id: this.get('id'),
        home_team: this.related('home_team').serialize(request),
        away_team: this.related('away_team').serialize(request),
        neutral_site: this.get('neutral_site'),
        site: this.get('site'),
        start_time: this.get('start_time'),
        spread: this.get('spread'),
        created_at: this.get('created_at'),
        updated_at: this.get('updated_at'),
        object: 'game'
      };
    }
  });
};
