'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.route('/api/upload/video').post(api.uploadVideo);

  // All undefined api routes should return a 404
  app.route('/api/*').get(function(req, res) {
    res.send(404);
  });

  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*').get(index.partials);
  app.route('/*').get( index.index);
};