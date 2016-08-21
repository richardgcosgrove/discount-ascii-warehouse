
var babel  = require('gulp-babel');
var cssnano = require('gulp-cssnano');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

gulp.task('babel', function() {
  return gulp.src('src/js/*.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('build/js'))
});

gulp.task('useref', function() {
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('static'))
});

gulp.task('default', ['babel', 'useref']);