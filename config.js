const config = {};

config.paths = {
  src: {
    njk: 'src/templates/pages/',
    scss: 'src/scss/',
    js: 'src/js/',
    images: 'src/images/',
    fonts: 'src/fonts/',
    data: 'src/data/',
  },
  dist: {
    njk: 'dist',
    css: 'dist/assets/css/',
    js: 'dist/assets/js/',
    images: 'dist/assets/images/',
    fonts: 'dist/assets/fonts/',
  },
  watch: {
    njk: 'src/templates/',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/*.js',
    images: 'src/images/**/*.{webp,jpeg,jpg,png,svg,gif}',
    fonts: 'src/fonts/*.{woff,woff2,eot,ttf}',
    data: 'src/data/',
  },
  inject: {
    css: '../assets/css/',
    js: '../assets/js/',
  },
};

export default config;
