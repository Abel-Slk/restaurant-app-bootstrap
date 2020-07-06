'use strict';

module.exports = function(grunt) {

    require('time-grunt')(grunt); // Time how long tasks take. Can help when optimizing build times

    // jit-grunt - to automatically load required Grunt tasks:
    require('jit-grunt')(grunt, { 
        useminPrepare: 'grunt-usemin' // this is to inform the jit-grunt configuration that useminPrepare task depends on the usemin package (otherwise "jit-grunt" is going to look around for a "useminPrepare" Grunt plugin)
    }); 

    // Define the configuration for all the tasks:
    grunt.initConfig({ // This configuration is basically a JavaScript object 
    //Grunt works on configuration, so every Grunt plugin that we wish to employ for performing a task needs to be configured inside this grunt.initConfig file
    
        
        sass: { // the sass task
            dist: {
                files: {
                    'css/styles.css': 'css/styles.scss' // the syntax here is "destination : source"! ":" here means "dependent on"! (note that this Grunt syntax is reversed compared to the sass terminal script - even though we're doing the same!)
                    // mb it should be 'css/*.css': 'css/*.scss' for a more general case?
                }
            }
        },
        watch: { // the watch task: keep a watch on the .scss files and then automatically compile them by invoking the sass task
            files: 'css/*.scss', 
            tasks: ['sass'] // I don't understand though why are we running the sass task here... So we're watching ALL .scss files (which is correct), but then using the sass task we comppile ONLY STYLES.scss??? Wtf? Is there a mistake? Perhaps the sass task should be edited? Probably to 'css/*.css': 'css/*.scss'? Cause this sass and watch tasks are supposed to mirror the "scss" and "watch:scss" scripts in package.json that we used for building the dist folder using npm scripts! And THERE everything is crystal clear - "scss": "sass css:css", "watch:scss": "onchange 'css/*.scss' -- npm run scss" - so there sass compiles ALL files! So here it should probably compile all as well!
            //OR - mb it IS correct - if the files in the watch task OVERRIDE the files in sass?? and does it automatically replace the two occurrences of css/styles with css/* in the sass task's files?? But that seems too far-fetched... I don't think it can guess correctly to substitute both 'styles'... Prob gotta edit the sass task to be 'css/*.css': 'css/*.scss'!
        },
        browserSync: {
            dev: {
                bsFiles: {  // this file specifies which files need to be watched for by my browserSync and then when any of these files change, browserSync will cause the browser to be reloaded
                    src: [ //all the files that we need to watch:
                        'css/*.css',
                        '*.html',
                        'js/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: './' // I specify the current directory as my base directory (and I guess the current dir is the same dir in which this Gruntfile.js is located)
                    }
                }
            }
        },
        copy: { // the copy task
            html: { // copying html files is needed for usemin. usemin expects us to also copy our HTML files to the distribution folder so that it can do the manipulation on that. (strage though why that is necessary - couldn't usemin process the html files in their usual location and THEN move the processed files to the dist folder?.. And when we were using npm scripts, we didn't have to set up a copy task for html files for usemin... This looks like a Grunt-specific idiosyncracy of Grunt's version of usemin...)
                files: [{ // Here we will use some of the grunt syntax for specifying the files that need to be copied. these are some configuration parameters that you need to set up for the copy task. if you need to understand, you'll be able to figure this out then by reading the documentation for the corresponding grunt plugin. or you can just simply follow the example that I am giving here:
                    expand: true,
                    dot: true,
                    cwd: './', // current working directory
                    src: ['*.html'],
                    dest: 'dist'
                }]
            },
            fonts: { // and this is just like copyfonts in npm scripts 
            // and I guess we had to make a separate copyfonts script in package.json when we were using npm scripts because while everything else that we need (all our html, css and js) WILL be copied into the dist folder by the usemin script, fonts WON'T! no one will copy the fonts! So we gotta do it ourselves!
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'node_modules/font-awesome',
                    src: ['fonts/*.*'], // src is files preceded by containing folder? (if there is any such folder - besides the base folder?)
                    dest: 'dist'
                }]
            }
        },
        clean: {
            build: {
                src: ['dist/']
            }
        },
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,   // Enable dynamic expansion
                    dot: true,  // this was in the vid but was absent in the text ver... 
                    cwd: './',  // Src matches are relative to this path
                    src: ['img/*.{png,jpg,gif}'],   // Actual patterns to match
                    dest: 'dist'    // Destination path prefix (so we get dist/img/...!)
                }]
            }
        },
        useminPrepare: { // starting to set up usemin. The first task that I need to configure is called useminPrepare. This useminPrepare task will prepare the files and then also configure the concat, cssmin, uglify and filerev plugins, so that they can do their work correctly. that's the reason for the useminPrepare - this is how the Grunt usemin plugin has been designed. Somewhat different from the way the usemin that we used with the npm scripts works. 
            foo: { // just some random name here
                dest: 'dist',
                src: ['contactus.html', 'aboutus.html', 'index.html']
            },
            options: { // This is something I have figured out by trial and error. Just follow along the steps. this is how the configuration has to be done. we just learn it by looking at the documentation
                flow: {
                    steps: {
                        css: ['cssmin'],
                        js: ['uglify']
                    },
                    post: {
                        css: [{
                            name: 'cssmin',
                            createConfig: function(context, block) {
                                var generated = context.options.generated; // a js object
                                generated.options = { // this object contains a property called options, where I can specify some options which are passed into the cssmin tasked by the useminPrepare task
                                    keepSpecialComments: 0, rebase: false // Apparently I need to supply this in order for my cssmin task to correctly handle the font awesome modification and inclusion in the concatenated file. If I don't do this, it seems to break the font awesome, and this is something that I figured out by doing a little bit of research on stack overflow and some of these places, and figured out that the problem that is being caused with font awesome can be fixed by including this into my grunt configuration. So, again I have just looked up the suggestions from some people that have tried and to fix the problem. So, if you run into problems like this, this is one way of solving issues that might arise when you're working with these various tools. 
                                };
                            }
                        }]
                    }
                }
            }

        },
        concat: { // the concat options will be configured by the useminPrepare that runs earlier, So we can leave most of it blank, and then it would be reconfigured by the useminPrepare. But we still need to write things like dist: {}, cause If I don't specify these, then the usemin task doesn't work correctly, So I need to specify all of these things explicitly
            options: { 
                separator: ';'
            },
            dist: {} // dist configuration is provided by useminPrepare
        },
        uglify: {
            dist: {} // dist configuration is provided by useminPrepare
        },
        cssmin: {
            dist: {} // dist configuration is provided by useminPrepare
        },
        filerev: { // adds a file revision number as a additional extension to the name of those css and js files (main.css and main.js)
        //  I didn't show you the "filerev" with the NPM scripts, but I just added it in here just to show you how it is done with the Grunt.
        // when you prepare a new version of your website and upload it to the web page, in case somebody has seen your Website earlier, then their browser might have cashed the main.css and main.js files. If you don't attach this filerev what happens is when the browser downloads the new version of your web page, It may not download the main.js and main.css file because it finds them already in it's local cache. So, your web page may not be rendered correctly. to deal with the problem, what we do is every time we prepare a new distribution folder, we will add a file revision. That's what the filerev stands for, the file revision number, as a additional extension to the name of those main.css and main.js files. So that's what the filerev does. 
        // Now how does this filerev can compute this value? It takes the contents of these files and then does some processing and then generates an md5 compressed 20 characters number which will be attached to the main file.
            options: { // in the options I specify how it's supposed to compute that number
                encoding: 'utf-8',
                algorithm: 'md5',
                length: 20
            },
            release: { // filerev:release hashes (md5) all assets (images, js and css) in the dist directory (images too? but we don't specify images in src below?..)
                files: [{
                    src: [
                        'dist/js/*.js',
                        'dist/css/*.css',
                    ]
                }]
            }
        },
        usemin: {
            html: ['dist/contactus.html', 'dist/aboutus.html', 'dist/index.html'], // specifying which files it needs to change
            options: {
                assetsDirs: ['dist', 'dist/css', 'dist/js'] // this is where all the assets that I'm using exist (the CSS and the JavaScript files)
            }
        },
        htmlmin: { // we'll perform "htmlmin" AFTER we finish "usemin" (while we'll do concat, cssmin, uglify, filerev BEFORE usemin!) because "usemin" will replace all the scripts with the main.js file and also all that CSS code concatenated and combined and replaced with the main.css file. So the htmlmin will be performed on the RESULTING HTML files after "usemin" has completed its work. This is how this works in Grunt. So the Grunt "htmlmin" has to be applied after the "usemin" has completed its work.
            dist: { // the target (htmlmin will be performed on all the HTML files that are in that folder)
                options: {  // Target options
                    collapseWhitespace: true, // meaning that all the white space in the HTML files would all be collapsed
                },
                files: {    // Dictionary of files
                    'dist/index.html': 'dist/index.html', // the syntax is "destination : source" (so the index.html in the dist folder will be minified and then put back into the index.html file, also in the dist folder)
                    'dist/contactus.html': 'dist/contactus.html',
                    'dist/aboutus.html': 'dist/aboutus.html'
                }
            }
        }


    });

    grunt.registerTask('css', ['sass']); // To execute this task, type "grunt css" at the prompt
    // the task's name is css, and it involves executing the sass task (which has already been configured above)
    // I guess registerTask() has two params like this prob because often by running a task we'd want to execute a series of tasks - so we give a name to this task and then specify in [] all the tasks (defined in initConfig() above) that we want to execute upon calling that task!
    
    
    grunt.registerTask('default', ['browserSync', 'watch']); // to execute the DEFAULT task, just type "grunt" at the Terminal prompt
    // the browserSync task first and then the watchTask later! If I do the watchTask first, it will basically stop everything and then all the remaining tasks behind that will not execute. So if you are using the watchTask, do that as a LAST ONE in the sequence that you specify in this square brackets. 
    // Note: same thing about order in Gulp - BUT this wasn't the case when we used NPM scripts! See the "watch:all" script! We executed watch first! But then, browser sync was done there using lite-server - so lite-server seems to give more flexibility...

    grunt.registerTask('build', [ // type "grunt build" to execute 
        // build will do these tasks  - in the following order:
        'clean',
        'copy',
        'imagemin',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify', // after this the main.css and main.js files are ready, and I can do the "filerev" on them and then finally run the usemin and htmlmin:
        'filerev',
        'usemin',
        'htmlmin'
    ]);
};