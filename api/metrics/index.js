(function (){
  'use strict';

  var express = require("express")
    , client  = require('prom-client')
    , app     = express()

  const metric = {
    http: {
      requests: {
        duration: new client.Summary('request_duration_seconds', 'request duration in seconds', ['method', 'path', 'cardinality', 'status']),
      }
    }
  }

  function s(start) {
    var diff = process.hrtime(start);
    return (diff[0] * 1e9 + diff[1]) / 1000000000;
  }

  function parse(path) {
    var ret = {
      path: path,
      cardinality: 'many'
    }

    if (path[path.length - 1] != '/') {
      if (!path.includes('.')) {
        ret.path = path.substr(0, path.lastIndexOf('/') + 1);
      }
      ret.cardinality = 'one';
    };

    return ret;
}

  function observe(method, path, statusCode, start) {
    var path = path.toLowerCase();
    if (path !== '/metrics' && path !== '/metrics/') {
        var duration = s(start);
        var method = method.toLowerCase();
        var split = parse(path);
        metric.http.requests.duration.labels(method, split.path, split.cardinality, statusCode).observe(duration);
    }
  };

  function middleware(request, response, done) {
    var start = process.hrtime();

    response.on('finish', function() {
      observe(request.method, request.path, response.statusCode, start);
    });

    return done();
  };


  app.use(middleware);
  app.get("/metrics", function(req, res) {
      res.header("content-type", "text/plain");
      return res.end(client.register.metrics())
  });

  module.exports = app;
}());
