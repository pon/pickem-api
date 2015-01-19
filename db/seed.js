var Bluebird  = require('bluebird');
var fs        = require('fs');
var knex      = require('knex')(require('./knexfile').development);

return Bluebird.promisify(fs.readdir)(__dirname + '/seeds/')
.map(function (filename) {
  return {
    name: filename.split('.')[0],
    data: require(__dirname + '/seeds/' + filename)
  };
})
.map(function (seed) {
  return knex(seed.name)
  .truncate()
  .then()
  .return(seed);
})
.map(function (seed) {
  return knex(seed.name)
  .insert(seed.data)
  .then()
  .return(seed.name);
})
.map(function (name) {
  console.log('Completed: ' + name);
})
.then(function () {
  process.exit(0);
})
.catch(function (err) {
  console.log(err);
  process.exit(1);
});
