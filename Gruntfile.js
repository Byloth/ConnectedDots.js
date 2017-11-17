module.exports = function(grunt)
{
    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            
            files: [ "Gruntfile.js", "src/**/*.js", "test/**/*.js" ],
            options: {
                
                esversion: 6,
                globals: {

                    console: true,
                    jQuery: true,
                    module: true
                }
            }
        },
        qunit: {

            files: [ "test/**/*.html" ]
        },
        clean: [ "build/", "dist/" ],
        concat: {

            options: {
                
                separator: ";"
            },
            dist: {

                src: [ "src/**/*.js" ],
                dest: "build/<%= pkg.name %>.js"
            }
        },
        babel: {

            options: {

                sourceMap: true,
                presets: [ "env" ]
            },
            dist: {
                
                files: {

                    "build/<%= pkg.name %>.js": "src/<%= pkg.name %>.js"
                }
            }
        },
        uglify: {
            options: {
                
                banner: "/*! <%= pkg.name %> <%= grunt.template.today('dd-mm-yyyy') %> */\n",
                sourceMap: true,
            },
            dist: {

                files: {

                    "dist/<%= pkg.name %>.min.js": [ "build/<%= pkg.name %>.js" ]
                }
            }
        },
        watch: {

            files: [ "<%= jshint.files %>" ],
            tasks: [ "jshint", "qunit" ]
        }
    });
    
    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("test", [ "jshint", "qunit" ]);
    grunt.registerTask("default", [ "jshint", "qunit", "clean", "concat", "babel", "uglify" ]);
};
