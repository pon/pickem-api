module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'teams',
    serialize: function (request) {
      return {
        id: this.get('id'),
        name: this.get('name'),
        object: 'team'
      };
    }
  });
};
