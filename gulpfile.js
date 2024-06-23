import gulp from 'gulp';
const { src, dest, watch, parallel, series } = gulp;
import config from './config.js';
const { paths } = config;
import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('./package.json'));

import minSCSS from 'gulp-clean-css';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(dartSass);
import autoprefixer from 'gulp-autoprefixer';
import stripCssComments from 'gulp-strip-css-comments';

import gulpWrite from 'gulp-sourcemaps';
const { write, init } = gulpWrite;

import browserSyncPkg from 'browser-sync';
const browserSync = browserSyncPkg.create();

import notify, { onError } from 'gulp-notify';
import iconfont from 'gulp-iconfont';
import consolidate from 'gulp-consolidate';

import minJS from 'gulp-uglify';
import babel from 'gulp-babel';
import stripJsComments from 'gulp-strip-comments';

import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';
import cleanDist from 'gulp-rimraf';

import nunjucksRender from 'gulp-nunjucks-render';
import htmlmin from 'gulp-htmlmin';
import gulpData from 'gulp-data';
const data = gulpData;
import { basename, extname, join } from 'path';

const imagesTask = () => {
  return src(paths.src.images + '**/*.{gif,svg,webp,jpg,jpeg,png}')
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        optimizationLevel: 3,
      })
    )
    .on('error', onError('Error: <%= error.message %>'))
    .pipe(
      notify({
        message: 'Images Optimized And Copied To Dist Successfully!',
        onLast: true,
      })
    )
    .pipe(dest(paths.dist.images));
};

const fontsTask = () => {
  console.log('pkg.name', pkg.name);
  return src(paths.src.fonts + '*.{eot,woff,woff2,ttf}')
    .pipe(
      notify({ message: 'Fonts Copied To Dist Successfully!', onLast: true })
    )
    .pipe(dest(paths.dist.fonts));
};

const scssTask = () => {
  return src(paths.src.scss + 'styles.scss')
    .pipe(init())
    .pipe(scss())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(stripCssComments({ preserve: false }))
    .pipe(minSCSS())
    .pipe(rename(`${pkg.name}.min.css`))
    .pipe(write('.'))
    .pipe(notify({ message: 'CSS Minified Successfully!', onLast: true }))
    .pipe(dest(paths.dist.css));
};

const injectCssToLayoutTask = (done) => {
  const layoutPath = 'src/templates/includes/layout/layout.njk';
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const scriptPlaceholder = '<!-- style_placeholder -->';
  const scriptTag = `<link rel="stylesheet" href="${paths.inject.css}${pkg.name}.min.css">`;
  layoutContent = layoutContent.replace(scriptPlaceholder, scriptTag);
  fs.writeFileSync(layoutPath, layoutContent);
  notify({
    message: 'CSS Injected To Layout Successfully!',
    onLast: true,
  }).write('');

  done();
};

const jsTask = () => {
  return src(paths.src.js + '*.js')
    .pipe(init())
    .pipe(stripJsComments())
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(minJS())
    .pipe(rename(`${pkg.name}.min.js`))
    .pipe(write('.'))
    .pipe(notify({ message: 'JS Minified Successfully!', onLast: true }))
    .pipe(dest(paths.dist.js));
};

const injectJsToLayoutTask = (done) => {
  const layoutPath = 'src/templates/includes/layout/layout.njk';
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const scriptPlaceholder = '<!-- script_placeholder -->';
  const scriptTag = `<script src="${paths.inject.js}${pkg.name}.min.js"></script>`;
  layoutContent = layoutContent.replace(scriptPlaceholder, scriptTag);
  fs.writeFileSync(layoutPath, layoutContent);
  notify({
    message: 'JS Injected To Layout Successfully!',
    onLast: true,
  }).write('');

  done();
};

function iconsTask(done) {
  const runTimestamp = Math.round(Date.now() / 1000);

  return src(`src/svg/**/*.svg`)
    .pipe(
      iconfont({
        fontName: pkg.name,
        prependUnicode: true,
        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
        timestamp: runTimestamp,
        normalize: true,
        fontHeight: 1001,
        centerHorizontally: true,
        error: function (err) {
          console.error('Error in iconfont generation', err);
        },
      })
    )

    .on('glyphs', function (glyphs) {
      const iconsScss = src('src/templates/tools/icons.njk')
        .pipe(
          consolidate('lodash', {
            glyphs: glyphs.map((glyph) => ({
              name: glyph.name,
              codepoint: glyph.unicode[0]
                .charCodeAt(0)
                .toString(16)
                .toUpperCase(),
            })),
            prefix: 'icon-',
          })
        )
        .pipe(rename('_icons-extend.scss'))
        .pipe(
          notify({
            message: 'Icon Styles Created Successfully!',
            onLast: true,
          })
        )
        .pipe(dest('src/scss/elements/'));
      return iconsScss;
    })

    .pipe(dest('dist/assets/fonts'))
    .pipe(
      notify({
        message: 'Icons Generated Successfully!',
        onLast: true,
      })
    )
    .on('end', function () {
      done();
    });
}

function nunjucksTask() {
  return src(paths.src.njk + '**/*.+(html|njk)')
    .pipe(
      data(function (file) {
        const fileName = basename(file.path, extname(file.path));
        const dataFilePath = join(paths.src.data, `${fileName}.json`);
        try {
          console.log(dataFilePath);
          const jsonData = JSON.parse(fs.readFileSync(dataFilePath));
          return jsonData;
        } catch (error) {
          console.error(`Error loading data from ${dataFilePath}:`, error);
          return {};
        }
      })
    )
    .pipe(nunjucksRender({ path: ['src/templates'], watch: true }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      notify({ message: 'Nunjucks Files Rendered Successfully!', onLast: true })
    )
    .pipe(dest(paths.dist.njk));
}

const browserSyncServer = (cb) => {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
  });
  cb();
};

const browserSyncReload = (cb) => {
  browserSync.reload();
  cb();
};

const cleanDistTask = () => {
  return src('dist/*', { read: false })
    .pipe(cleanDist())
    .pipe(
      notify({ message: 'Dist Folder Cleaned Successfully!', onLast: true })
    );
};

const watchTask = () => {
  watch(
    [paths.watch.njk + '**/*.+(html|njk)', paths.watch.data + '**/*.json'],
    parallel(nunjucksTask, browserSyncReload)
  );
  watch(
    [paths.watch.scss, paths.watch.js, paths.watch.images, paths.watch.fonts],
    parallel(imagesTask, fontsTask, scssTask, jsTask, browserSyncReload)
  );
};

const buildTask = series(
  cleanDistTask,
  parallel(
    iconsTask,
    imagesTask,
    fontsTask,
    nunjucksTask,
    scssTask,
    injectCssToLayoutTask,
    jsTask,
    injectJsToLayoutTask,
    browserSyncServer,
    watchTask
  )
);

export {
  cleanDistTask,
  iconsTask,
  imagesTask,
  fontsTask,
  scssTask,
  injectCssToLayoutTask,
  jsTask,
  injectJsToLayoutTask,
  nunjucksTask,
  browserSyncServer,
  browserSyncReload,
  watchTask,
  buildTask,
};

export default buildTask;
