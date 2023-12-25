import gulp from "gulp";
import notify from "gulp-notify";
import rename from "gulp-rename";
import sourcemaps from "gulp-sourcemaps";
import browserSync from "browser-sync";
import fileInclude from "gulp-file-include";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import svgSprite from "gulp-svg-sprite";
import ttf2woff2 from "gulp-ttf2woff2";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import terser from "gulp-terser";
import { deleteAsync } from "del";
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin";
import htmlMinify from "html-minifier"; // подключаем html-minifier
import postcss from "gulp-postcss"; // подключаем gulp-postcss
import autoprefixer from "autoprefixer"; // подключаем autoprefixer
import mediaquery from "postcss-combine-media-query"; // подключаем postcss-combine-media-query
import cssnano from "cssnano"; // подключаем cssnano

const sass = gulpSass(dartSass);

export const fonts = () => {
  return gulp
    .src("./src/fonts/**.ttf")
    .pipe(ttf2woff2())
    .pipe(gulp.dest("./dist/fonts"));
};

export const htmlInclude = () => {
  const options = {
    /**
     * Настройки для плагина html-minifer
     */
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true,
  };

  return gulp
    .src(["./src/index.html"])
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .on("data", function (file) {
      const buferFile = Buffer.from(
        htmlMinify.minify(file.contents.toString(), options)
      );
      return (file.contents = buferFile);
    })
    .pipe(gulp.dest("./dist"))
    .pipe(browserSync.stream());
};

export const styles = () => {
  const plugins = [
    /**
     * autoprefixer - этот плагин смотрит browserslist внутри package.json
     * и подставляет вендорные префиксы для браузеров, которым они нужны
     *
     * mediaquery (postcss-combine-media-query) - находит все медиазапросы
     * с одинаковым параметрами в исходниках и склеивает их в один медиазапрос при сборке
     *
     * cssnano - минификация сборки
     */
    autoprefixer(),
    mediaquery(),
    cssnano(),
  ];

  return gulp
    .src("src/styles/*.scss")
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", notify.onError())
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(postcss(plugins))
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./dist/styles/"))
    .pipe(browserSync.stream());
};

export const assets = () => {
  return gulp.src("./src/assets/**").pipe(gulp.dest("./dist/assets"));
};

export const clean = () => {
  return deleteAsync(["./dist"]);
};

export const scripts = () => {
  return gulp
    .src("./src/scripts/main.js")
    .pipe(
      webpackStream({
        output: {
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.(?:js|mjs|cjs)$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-env", { targets: "defaults" }]],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(sourcemaps.init())
    .pipe(terser().on("error", notify.onError()))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./dist/scripts"))
    .pipe(browserSync.stream());
};

export const imgToDest = () => {
  return gulp
    .src(["./src/images/**.{jpg,png,webp,avif,jpeg,svg}"])
    .pipe(gulp.dest("./dist/images"));
};

export const svgToSprite = () => {
  return gulp
    .src("./src/images/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(gulp.dest("./dist/images/svg"));
};

export const imageMin = () => {
  return gulp
    .src("./src/images/**.{jpg,png,webp,avif,jpeg}")
    .pipe(
      imagemin([
        gifsicle({ interlaced: true }),
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [
            {
              name: "removeViewBox",
              active: true,
            },
            {
              name: "cleanupIDs",
              active: false,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest("dist/images"));
};

export const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });

  gulp.watch("./src/styles/**/*.scss", styles);
  gulp.watch("./src/index.html", htmlInclude);
  gulp.watch("./src/images/**.{jpg,png,webp,avif,jpeg}", imgToDest);
  gulp.watch("./src/images/svg/**.svg", svgToSprite);
  gulp.watch("./src/assets/**", assets);
  gulp.watch("./src/fonts/**.ttf", fonts);
  gulp.watch("./src/scripts/**/*.js", scripts);
};

export default gulp.series(
  clean,
  gulp.parallel(htmlInclude, scripts, fonts, imgToDest, svgToSprite, assets),
  styles,
  // imageMin,
  watchFiles
);
