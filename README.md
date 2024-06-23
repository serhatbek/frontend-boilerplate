# Frontend Boilerplate - Gulp & Nunjucks

This is a [Gulp](https://gulpjs.com/) setup to automate frontend development tasks like minification, transpilation, and optimization. Using [Nunjucks](https://mozilla.github.io/nunjucks/) templating engine.

## Features

- Transfer fonts and images from src to dist
- Compress image size and transfer them from src to dist.
- Compile, minify and autoprefix scss with map.
- Minify JavaScript file with map.
- Create minified maps for js and css files.
- Assign the name of the project to the css and js files and.
- Watch for file changes and refresh the browser automatically.
- Watch for data changes in json files and refresh the browser automatically.
- Automatically recompile all assets (CSS, JS, fonts, and images) for dist.

## Introduction

This starter-template simplifies frontend development by automating repetitive tasks, enhancing productivity, and ensuring efficient project workflow. There two main files: **config.js** and **gulpfile.js**.

> **config.js**
> Contains a config object that has paths related to different directories in the project. The file exports the config object as the default export so that other modules can import and use these paths in their Gulp tasks or any other necessary configurations. Directory paths categorized into four main sections: src, dist, watch and inject.

- **src**: Contains paths to the source (input) directories.
- **dist**: Contains paths to the distribution (output) directories.
- **watch**: Contains paths or patterns used for watching changes in specific directories and file types.
- **inject**: Contains paths of output css and js files for automatically injecting them in our layout.njk file.

> **gulpfile.js**
> This file imports necessary modules and various Gulp plugins to automate the frontend tasks. Tasks are:

##### Image Optimization Task (copyImages)

- Uses gulp-imagemin to optimize images (GIF, SVG, WebP, JPG, JPEG, PNG) in the source directory.
- Sends any error notifications using gulp-notify.
- Outputs the optimized images to the distribution folder.

##### Font Transfer Task (transferFonts)

- Transfers font files (EOT, WOFF, WOFF2, TTF) from the source directory to the distribution folder.

##### SCSS Compilation Task (compileScss)

- Compiles SCSS files (styles.scss) to CSS using gulp-sass.
- Applies autoprefixing for compatibility with older browser versions using gulp-autoprefixer.
- Minifies the compiled CSS using gulp-clean-css.
- Generates source maps for easier debugging using gulp-sourcemaps.
- Renames the output file to styles.min.css and saves it in the distribution folder.

##### JavaScript Compilation Task (compileJs)

- Minifies JavaScript files in the source directory using gulp-uglify.
- Generates source maps for the minified files using gulp-sourcemaps.
- Renames the output file to filename.min.js and saves it in the distribution folder.

##### Injecting CSS/JS Files Tasks (injectCssIntoLayout, injectJsIntoLayout)

These functions define placeholder strings **script_placeholder** within the content of the layout.njk file and then perform file manipulation to inject **script** and **link** tags for css and js at the specified placeholder location.

##### Nunjucks Rendering Task (njkRender)

- Renders Nunjucks templates (.html and .njk files) located in the source directory (src/templates/pages/).
- Dynamically injects data into templates based on corresponding JSON files in the src/data/ directory.
- Uses gulp-nunjucks-render for template rendering.

##### BrowserSync Server and Reload Tasks (browserSyncServer and browserSyncReload)

- browserSyncServer: Initializes a BrowserSync server with the base directory set to 'dist'.
- browserSyncReload: Reloads the BrowserSync server to reflect changes in the browser.

##### Clean Dist Task (cleanDist)

Delete all files and subdirectories within the dist folder. Clean the dist folder before running other tasks in parallel.

##### Watching Files for Changes (watchTasks)

- Monitors specific directories and file types for changes using gulp.watch.
- Executes corresponding tasks whenever changes are detected.

##### Build Task (build)

- Combines multiple tasks (image optimization, font transfer, SCSS compilation, JS compilation, Nunjucks rendering, BrowserSync server initialization, and watching tasks) to run in parallel.
- Exports the build task to run when Gulp is executed without any specific task command.

## Usage

If you've previously installed gulp globally, run **npm rm --global gulp** before following these instructions. Install [Node.js](https://nodejs.org/en/) version 20.9.0, if installed you can use [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

Clone the project

```bash
  git clone https://gulp-nunjucks-starter
```

Go to the project directory

```bash
  cd gulp-nunjucks-starter
```

Change the remote url and verify the change

```bash
  git remote set-url origin <new_remote_url>
```

```bash
  git remote -v
```

> Change project "name" in the package.json file. Thus, the output css and js files will match the project name and will be automatically added to the layout.njk file.

If everything is correct, install and change Node version

```bash
  nvm install 20.9.0
```

```bash
  nvm use 20.9.0
```

Install the gulp command line utility

```bash
  npm install --global gulp-cli
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  gulp
```

## Development and Production

When you run the 'gulp' command, it initiates a local server for the site and automatically opens your default browser. Any saved changes trigger an automatic regeneration of files in dist, updating your browser with the latest content.

You can import data from json files to your njk files. When importing data, your json and njk file names should be same like home.json and home.njk. Keep this in mind when adding new njk and json files for data. I left and example in src/data folder.

You don't need to use index.json file. I left it there to avoid **ENOENT: no such file or directory** error.

➡️ If you find this repo useful and feel happy, please give a ⭐️ and let it shine. 🙃
