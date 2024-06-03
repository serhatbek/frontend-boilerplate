const config = {};

config.paths = {
  src: {
    scss: 'src/scss/',
    js: 'src/js/',
    images: 'src/images/',
    fonts: 'src/fonts/',
    data: 'src/data/',
  },
  dist: {
    css: 'dist/assets/css/',
    js: 'dist/assets/js/',
    images: 'dist/assets/images/',
    fonts: 'dist/assets/fonts/',
  },
  watch: {
    scss: 'src/scss/**/*.scss',
    js: 'src/js/*.js',
    images: 'src/images/**/*.{webp,jpeg,jpg,png,svg,gif}',
    fonts: 'src/fonts/*.{woff,woff2,eot,ttf}',
  },
};

export default config;
