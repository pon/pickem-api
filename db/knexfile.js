var path = require('path');

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '/pickem_dev.sqlite3')
    },
    migrations: {
      directory: path.join(__dirname, '/migrations'),
      tableName: 'migrations'
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '/pickem_prod.sqlite3')
    },
    migrations: {
      directory: path.join(__dirname, '/migrations'),
      tableName: 'migrations'
    }
  },
};
