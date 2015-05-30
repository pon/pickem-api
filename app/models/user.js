module.exports = function (bookshelf) {
  return bookshelf.extend({
    tableName: 'users',
    serialize: function (request) {
      return {
        id: this.get('id'),
        first_name: this.get('first_name'),
        last_name: this.get('last_name'),
        email: this.get('email'),
        updated_at: this.get('updated_at'),
        created_at: this.get('created_at'),
        object: 'user'
      };
    }
  });
};
