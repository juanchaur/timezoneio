var path = require('path');
var express = require('express');
var logger = require('morgan');
var stylus = require('stylus');
var autoprefixer  = require('autoprefixer-stylus');
var slashes = require('connect-slashes');

require('node-jsx').install({extension: '.jsx'});

var baseController = require('./controllers/base.js');
var teamController = require('./controllers/team.js');
var peopleController = require('./controllers/people.js');


// Stylus
var stylusMiddleware = stylus.middleware({
  src:     path.join(__dirname, '../assets'),
  dest:    path.join(__dirname, '../public'),
  compile: function (str, path, fn) {
    return stylus(str)
      .use(autoprefixer())
      .set('filename', path)
      .set('compress', true);
  }
});


module.exports = function() {
  var app = express();

  app.use(stylusMiddleware);
  app.use(slashes(false));
  app.use(logger('common'));

  app.get('/', baseController.index);
  app.get('/team/:name', teamController.index);
  app.get('/people/:username', peopleController.index);

  app.use(express.static(path.join(__dirname, '../public')));

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message && 
        (~err.message.indexOf('not found') || 
         (~err.message.indexOf('Cast to ObjectId failed'))
        )
        ) {
      return next();
    }
    console.error(err.stack);
    // error page
    // res.status(500).render('500', { error: err.stack });
    res.status(500).send({ error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    // res.status(404).render('404', {
    //   url: req.originalUrl,
    //   error: 'Not found'
    // });
    res.status(404).send('404 Not found!');
  });

  app.listen(8080);
};

