'use strict';

// Load in all the Gulp plugins:
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync');

//As I mentioned in the previous exercise, it will become more clearer to you why the code is written like this, once you understand more about node modules in a later course. 

// Gulp is a code-based way of configuring tasks (unlike Grunt which relies more on configuration of the tasks):
gulp.task('sass', function() {  // the sass task
    return gulp.src('./css/*.scss')     // create a stream of files
        .pipe(sass().on('error', sass.logError))    // pipe them through sass() (and on error use sass.logError)
        // note: logError without ()! Even though it's highlighed as a function automatically and looks like it should have a CALL here with ()! But when I added () it resulted in an error!
        .pipe(gulp.dest('./css'));  // pipe them through gulp.dest()
});
//  this is what we call Gulp Streams. The way Gulp works is like you take a set of files and you specify the set of files using gulp.src as we did with the sass task. gulp.src is the function that takes the files. You could even specify the files using the globbing patterns that we learnt in Grunt, and then it creates a stream of objects that represents these files. 
//once the stream is created, then the stream can be piped through a set of functions one after another in order to transform these files. And then finally, the resulting transformed files can be put into a destination location.
// that's how a typical task is specified in gulp because gulp operates on streams. you stream files through the pipes until the files are transformed, and then they are deposited at the specified destination

gulp.task('sass:watch', function() {
    gulp.watch('./css/*.scss', ['sass']);    // watch() is already built in into Gulp
    //on any changes in those files the sass task will be run
});

gulp.task('browser-sync', function() {
    var files = [
        './*.html',
        './css/*.css',
        './js/*.js',
        './img/*.{png,jpg,gif}' // why are we watching images here? we didn't do this for browserSync in Grunt... But then, mb we SHOULD have? Because what happens if we update some images? Would watching just html be enough?..
    ];

    // now we'll use the browserSync var that we defined earlier:
    browserSync.init(files, { // the first parameter is the files that will need to be watched, and then the second parameter specifies the options that we are giving to the browser
        server: { // just like in Grunt 
            baseDir: './'
        }
    }); 
});

gulp.task('default', ['browser-sync'], function() { // just type "gulp" to run the default task
    gulp.start('sass:watch'); // Make sure that the browser sync task is running before the sass watch task is started. this is the syntax for specifying that in gulp. 
    // Note: same thing about order in Grunt - BUT this wasn't the case when we used NPM scripts! See the "watch:all" script! We executed watch first! But then, browser sync was done there using lite-server - so lite-server seems to give more flexibility...
});