var gulp = require('gulp'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	del = require('del'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync').create();


gulp.task('browser-sync', function(){
	browserSync.init({
		server: {
			baseDir: 'builds/development'
		},
	})
});

gulp.task('pug', function buildHTML() {
  return gulp.src('src/templates/**/*.pug')

	.pipe(pug({
		pretty: true
	}))
  	
  	.pipe(gulp.dest('builds/development'))
	.pipe(browserSync.reload({
		stream: true
	}))
});

gulp.task('images', function(){
  return gulp.src('src/assets/images/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('builds/development/assets/images'))
});

gulp.task('sass', function(){
	return gulp.src('src/assets/sass/**/*.scss')
	.pipe(sass())
	.pipe(gulp.dest('builds/development/assets/css'))
	.pipe(browserSync.reload({
		stream: true
	}))
});

gulp.task('scripts', function(){
	gulp.src('src/assets/js/**/*.js')
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('builds/development/assets/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('watch', ['sass', 'pug', 'images', 'browser-sync'], function(){
	gulp.watch('src/assets/sass/**/*.scss', ['sass']);
	gulp.watch('src/templates/**/*.pug', ['pug']);
	gulp.watch('src/assets/js/**/*.js', ['scripts']);
	gulp.watch('src/assets/images/**/*.+(png|jpg|gif|svg)', ['images']);
});

gulp.task('clean:builds', function(){
	return del.sync('builds');
});

gulp.task('build', function(callback){
	runSequence('clean:builds', ['pug', 'images', 'sass', 'scripts', 'watch', 'browser-sync'], 
		callback
	)
});

gulp.task('default', function(callback){
	runSequence(['pug', 'images', 'sass', 'scripts', 'watch', 'browser-sync'], 
		callback
	)
});