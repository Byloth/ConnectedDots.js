/**
 * Created by Matteo on 01/10/2016.
 */

const SOURCE_DIRS = [ "src/**/*.js" ];
const OUTPUT_DIRS = [ "dist" ];

var del = require("del");
var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var sourceMaps = require("gulp-sourcemaps");

gulp.task("clean", function()
{
	return del(OUTPUT_DIRS);
});

gulp.task("make", [ "clean" ], function()
{
    return gulp.src(SOURCE_DIRS)
		.pipe(sourceMaps.init())
			.pipe(uglify())
			.pipe(concat("connected-dots.min.js"))
		.pipe(sourceMaps.write("."))
		.pipe(gulp.dest("dist"));
});

gulp.task("watch", function()
{
    return gulp.watch(SOURCE_DIRS, [ "make" ]);
});

gulp.task("default", [ "make", "watch" ]);
