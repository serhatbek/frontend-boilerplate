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

import gulpWrite from 'gulp-sourcemaps';
const { write, init } = gulpWrite;

import browserSyncPkg from 'browser-sync';
const browserSync = browserSyncPkg.create();

import notify, { onError } from 'gulp-notify';

import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';
import minJS from 'gulp-uglify';
import autoprefixer from 'gulp-autoprefixer';
import clean from 'gulp-clean';

import nunjucksRender from 'gulp-nunjucks-render';
import gulpData from 'gulp-data';
const data = gulpData;
import { basename, extname, join } from 'path';

const imagesTask = () => {
  return src(paths.src.images + '**/*.{gif,svg,webp,jpg,jpeg,png}')
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        // png optimization
        optimizationLevel: 3,
      })
    )
    .on('error', onError('Error: <%= error.message %>'))
    .pipe(notify({ message: 'Images optimized.', onLast: true }))
    .pipe(dest(paths.dist.images));
};

const fontsTask = () => {
  return src(paths.src.fonts + '*.{eot,woff,woff2,ttf}')
    .pipe(notify({ message: 'Fonts transferred.', onLast: true }))
    .pipe(dest(paths.dist.fonts));
};

const scssTask = () => {
  return src(paths.src.scss + 'styles.scss')
    .pipe(init())
    .pipe(scss())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(minSCSS())
    .pipe(rename(`${pkg.name}.min.css`))
    .pipe(write('.'))
    .pipe(notify({ message: 'CSS minified.', onLast: true }))
    .pipe(dest(paths.dist.css));
};

const injectCssToLayoutTask = () => {
  const layoutPath = 'src/templates/includes/layout/layout.njk';
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const scriptPlaceholder = '<!-- style_placeholder -->';
  const scriptTag = `<link rel="stylesheet" href="${paths.inject.css}${pkg.name}.min.css">`;
  layoutContent = layoutContent.replace(scriptPlaceholder, scriptTag);
  fs.writeFileSync(layoutPath, layoutContent);
};

const jsTask = () => {
  return src(paths.src.js + '*.js')
    .pipe(init())
    .pipe(minJS())
    .pipe(rename(`${pkg.name}.min.js`))
    .pipe(write('.'))
    .pipe(notify({ message: 'JS minified', onLast: true }))
    .pipe(dest(paths.dist.js));
};

const injectJsToLayoutTask = () => {
  const layoutPath = 'src/templates/includes/layout/layout.njk';
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const scriptPlaceholder = '<!-- script_placeholder -->';
  const scriptTag = `<script src="${paths.inject.js}${pkg.name}.min.js"></script>`;
  layoutContent = layoutContent.replace(scriptPlaceholder, scriptTag);
  fs.writeFileSync(layoutPath, layoutContent);
};

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
    .pipe(notify({ message: 'Nunjucks files rendered', onLast: true }))
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
  return src('dist/**/*', { read: false })
    .pipe(clean())
    .pipe(notify({ message: 'Dist files cleaned', onLast: true }));
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

export default buildTask;
