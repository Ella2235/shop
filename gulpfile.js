const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const map = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const imagemin = require("gulp-imagemin");

gulp.task("clean", function (done) {
  if (fs.existsSync("./dist/")) {
    return gulp.src("./dist/", { read: false }).pipe(clean({ force: true }));
  }
  done();
});

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

const fileIncludeSetting = {
  prefix: "@@",
  basepath: "@file",
};

gulp.task("html", function () {
  return gulp
    .src("./app/**/*.html")
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSetting))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("sass", function () {
  return gulp
    .src("./app/scss/*.scss")
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(map.init())
    .pipe(sass())
    .pipe(map.write())
    .pipe(gulp.dest("./dist/css/"));
});

gulp.task("images", function () {
  return gulp
    .src("./app/img/**/*")
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./dist/img/"));
});

gulp.task("fonts", function () {
  return gulp.src("./app/fonts/**/*").pipe(gulp.dest("./dist/fonts/"));
});

gulp.task("files", function () {
  return gulp.src("./app/files/**/*").pipe(gulp.dest("./dist/files/"));
});

const serverOptions = {
  livereload: true,
  open: true,
};

gulp.task("js", function () {
  return gulp
    .src("./app/js/*.js")
    .pipe(plumber(plumberNotify("JS")))
    .pipe(webpack(require("./webpack.config.js")))

    .pipe(gulp.dest("./dist/js"));
});

gulp.task("server", function () {
  return gulp.src("./dist/").pipe(server(serverOptions));
});

gulp.task("watch", function () {
  gulp.watch("./app/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("./app/**/*.html", gulp.parallel("html"));
  gulp.watch("./app/img/**/*", gulp.parallel("images"));
  gulp.watch("./app/fonts/**/*", gulp.parallel("fonts"));
  gulp.watch("./app/files/**/*", gulp.parallel("files"));
  gulp.watch("./app/js/**/*.js", gulp.parallel("js"));
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("html", "sass", "images", "fonts", "files", "js"),
    gulp.parallel("server", "watch")
  )
);
