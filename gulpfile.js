'use strict';

// Load in all the Gulp plugins:
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cleanCss = require('gulp-clean-css'),
    flatMap = require('gulp-flatmap'),
    htmlmin = require('gulp-htmlmin');

//As I mentioned in the previous exercise, it will become more clearer to you why the code is written like this, once you understand more about node modules in a later course. 

// Gulp is a code-based way of configuring tasks (unlike Grunt which relies more on configuration of the tasks):
gulp.task('sass', function() {  // the sass task. It compiles .scss files to .css - but not automatically - only after we type "gulp sass" at the prompt. To make the conversion automamatic after any change in .scss files we'll use this sass task in the sass:watch task below 
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
    // on any changes in those files the sass task will be run
    // ./ means current working directory (I guess the current dir is the same dir in which this gulpfile.js is located)
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
// the args mean first do browser-sync and then execute the anonymous function
    gulp.start('sass:watch'); 
    // We gotta Make sure that the browser sync task is running before the sass watch task is started. this is the syntax for specifying that in gulp. 
    // Note: same thing about order in Grunt - BUT this wasn't the case when we used NPM scripts! See the "watch:all" script! We executed watch first! But then, browser sync was done there using lite-server - so lite-server seems to give more flexibility...
});

gulp.task('clean', function() {
    return del(['dist']); // the dist folder will be deleted
});

gulp.task('copyfonts', function() {
   gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*') 
   // using globbing patterns here
   // the * at the end of .{ttf,woff,eof,svg}* is to match variations of those extensions - ex woff2!

   //"*" matches any number of characters within name
   // ex d*o matches doodoo, dao, and just do

   //"**" matches any number of characters across all directories (in ANY subdirectory, no matter how deep)
   // ex: 
   // Match a/b/z but not a/b/c/z:
    // a/*/z
    // Match a/z and a/b/z and a/b/c/z:
    // a/**/z
   // more at https://commandbox.ortusbooks.com/usage/parameters/globbing-patterns
   .pipe(gulp.dest('./dist/fonts'));
});
// notice that we don't need a specific module for arranging the copying of the files. We simply use the Gulp source and destination streams to be able to pipe the files from the source location to the destination location.

gulp.task('imagemin', function() {
    return gulp.src('img/*.{png,jpg,gif}')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('usemin', function() { // the usemin task takes the html files and then looks up the CSS and JavaScript blocks in the html files, combines, concatenates, and minifies and uglifies the files, and then replaces them by the concatenated file in the distribution folder.
// NOTE: I noticed that Gulp's and Grunt's versions of usemin don't remove comments! While npm scripts' usemin does! 
    return gulp.src('./*.html')
    .pipe(flatMap(function(stream, file) { // pipe through the flatMap module. Flatmap takes multiple html files (ex we have 3) and starts up parallel pipelines for each one of these html files. Each one of them going through the same set of steps. and then finally converging and copying it into the destination folder.
    // the file arg takes each one of those source files and then treats them to the same set of functions here, and then starts up its separate stream for each one of them.
        return stream // I will return stream, and then I will pipe each one of these through the usemin task (which itself comprises of the css and uglify JavaScript and html task)
        .pipe(usemin({  
            css: [ rev() ],
            html: [ function() { return htmlmin({collapseWhitespace: true}) } ], // for html, because I have multiple html files, I need to specify this as a function, and inside this function I would say return htmlmin
            js: [ uglify(), rev() ],
            inlinejs: [ uglify() ],
            inlinecss: [ cleanCss(), 'concat' ] // for the inlinecss code, we'll use the cleanCss task with concat as the arg
        }))
    }))
    .pipe(gulp.dest('dist/')); 
});

gulp.task('build', ['clean'], function() { // you need to first execute the clean task before the remaining tasks are executed because we want to first clean up the distribution folder. And that has to be completed before the remaining tasks are done. With Gulp, the tasks are executed in parallel automatically. And so it may so happen that if you execute the clean task in parallel with the remaining task, the clean task might end up finishing later and then deleting some of the work that has been done by the remaining tasks. So, that's why when you specify the Gulp task, if you specify clean as the first one in, as the second parameter here, then that means that that task will be completed first. And then the remaining tasks will be executed. 
    gulp.start('copyfonts', 'imagemin', 'usemin'); // And With gulp.start(), all the tasks that we specify here are going to be executed in parallel
});

