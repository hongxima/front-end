(function (){
  'use strict';

  var express = require("express")
    , client  = require('prom-client')
    , app     = express()

  app.get("/metrics", function(req, res) {
      res.end(client.defaultMetrics())
  });

  module.exports = app;
}());
