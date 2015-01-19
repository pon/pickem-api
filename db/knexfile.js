var path = require('path');

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './pickem.sqlite3'
    },
    migrations: {
      directory: path.join(__dirname, '/migrations'),
      tableName: 'migrations'
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
