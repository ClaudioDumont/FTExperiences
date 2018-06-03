var gulp = require('gulp'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	del = require('del'),
	babel = require('gulp-babel'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync').create(),
	fractal = require('@frctl/fractal').create();


//Fractal Config

fractal.set('FTExperiences', 'FooCorp Component Library'); 
fractal.web.set('builder.dest', 'build'); 
fractal.docs.set('path', `${__dirname}src/docs`);
fractal.components.set('path', `${__dirname}src/components`); 

var logger = fractal.cli.console; 

gulp.task('fractal:start', function(){
    const server = fractal.web.server({
        sync: true
    });
    server.on('error', err => logger.error(err.message));
    return server.start().then(() => {
        logger.success(`Fractal server is now running at ${server.url}`);
    });
});

gulp.task('fractal:build', function(){
    const builder = fractal.web.builder();
    builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
    builder.on('error', err => logger.error(err.message));
    return builder.build().then(() => {
        logger.success('Fractal build completed!');
    });
});

//Fractal Config

gulp.task('browser-sync', function(){
	browserSync.init({
		server: {
			baseDir: 'builds/development'
		},
	})
});

gulp.task('pug', function buildHTML() {
  return gulp.src('src/components/templates/**/*.pug')
	.pipe(pug({
		pretty: true
	}))
  	.pipe(gulp.dest('builds/development'))
	.pipe(browserSync.reload({
		stream: true
	}))
});

gulp.task('images', function(){
  return gulp.src('src/components/assets/images/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('builds/development/assets/images'))
});

gulp.task('sass', function(){
	return gulp.src('src/components/assets/sass/**/*.scss')
	.pipe(sass())
	.pipe(gulp.dest('builds/development/assets/css'))
	.pipe(browserSync.reload({
		stream: true
	}))
});

gulp.task('scripts', function(){
	gulp.src('src/components/assets/js/**/*.js')
		.pipe(rename({suffix: '.min'}))
		.pipe(babel({
      		presets: ['env']
    	}))
		.pipe(uglify())
		.pipe(gulp.dest('builds/development/assets/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('watch', ['sass', 'pug', 'images', 'browser-sync'], function(){
	gulp.watch('src/components/assets/sass/**/*.scss', ['sass']);
	gulp.watch('src/components/templates/**/*.pug', ['pug']);
	gulp.watch('src/components/assets/js/**/*.js', ['scripts']);
	gulp.watch('src/components/assets/images/**/*.+(png|jpg|gif|svg)', ['images']);
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