/**
 * @file Express server configuration.
 * @author Jonathan Keller
 */
const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const lessMiddleware = require('less-middleware');
const fs = require('fs');
const marked = require('marked');

const { getConfig } = require('../lib/config');

const app = express();
const LOG = require('debug')('tt:server');

const config = getConfig();

// view engine setup
app.engine('md', (filePath, options, callback) => {
  LOG(`Reading: ${filePath}`);
  fs.readFile(filePath, 'utf8', (err, mdData) => {
    LOG(`Original Markdown Text: \n${mdData}`);
    marked(mdData, (err2, renderedContent) => {
      if (err2) {
        throw err2;
      }
      const html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>TODO: PAGE TITLE</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <link rel="stylesheet" href="/bootstrap.css" />
          <!-- <link rel="stylesheet" href="/style.css" /> -->
        </head>
        <body>
          <div class="container">
            ${renderedContent}
          </div>
          <script src="/jquery-3.2.1.slim.min.js"></script>
          <script>
            $('.container').find('table').addClass('table table-sm table-striped');
            $('.container').find('ul').addClass('list-group');
            $('.container').find('li').addClass('list-group-item');
            $('.container').find('li > ul > li').addClass('list-group-item-secondary');
          </script>
        </body>
      </html>
      `;

      return callback(null, html);
    });
  });
});
app.set('views', [config.mlogLocation, path.join(__dirname, 'views')]);
app.set('view engine', 'md');
app.set('case sensitive routing', false);
app.set('strict routing', false);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page. */
app.get('/', (req, res, next) => { // eslint-disable-line no-unused-vars
  res.render('index');
});

app.get('/*', (req, res, next) => { // eslint-disable-line no-unused-vars
  LOG(req.path);
  res.render(req.path.substr(1));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.ejs');
});

module.exports = app;
