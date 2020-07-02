'use strict';

module.exports = function(grunt) {

    require('time-grunt')(grunt);

    require('jit-grunt')(grunt);

    //Grunt works on configuration, so every Grunt plug-in that we wish to employ for performing a task, it needs to be configured inside this Grunt initConfig file. This configuration is basically a JavaScript object 
    grunt.initConfig({
        sass: {
            dist: {
                files: {
                    'css/styles.css': 'css/styles.scss' //: here means "dependent on" (note that compared to sass terminal script the order of files is reversed - even though we're doing the same!  
                }
            }
        },
        watch: { // keep a watch on the .scss files and then automatically compile them by invoking the sass task
            files: 'css/*.scss', 
            tasks: ['sass']
        },
        browserSync: {
            dev: {
                bsFiles: {  // this file specifies which files need to be watched for by my browserSync and then when any of these files change, then my browserSync will cause the browser to be reloaded
                    src: [ //all the files that we need to watch:
                        'css/*.css',
                        '*.html',
                        'js/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: './' // I specify the current directory, as my base directory
                    }
                }
            }
        }

    });

    grunt.registerTask('css', ['sass']); // To execute this task, type "grunt css" at the prompt
    // the task's name is css, and it involves executing the sass task (which has already been configured above)
    
    
    grunt.registerTask('default', ['browserSync', 'watch']); // to execute the DEFAULT task, just type "grunt" at the Terminal prompt
    // For this default task, what do I need to do? I need to execute the browserSync task and also the watch task. I will have to do the browserSync task first and then the watchTask later. Because the browserSync task will start serving up my server. If I do the watchTask first and the browserSync task later, the watchTask will basically stop everything and then all the remaining tasks behind that will not execute. So if you are using the watchTask, do that as a LAST ONE in the sequence that you specify in this square brackets. 
};