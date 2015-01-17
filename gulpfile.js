var gulp      = require('gulp');
var plugins   = require('gulp-load-plugins')();

gulp.task('start', function () {
  plugins.nodemon({
    script: 'app/server.js',
    ext: 'js'
  });
});
