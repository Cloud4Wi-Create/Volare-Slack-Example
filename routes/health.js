var express = require('express');
var router = express.Router();

var Request = require('request');
var dbs = require('../utils/data-handler');

router.get('/', function(req, res, next) {
  dbs.checkHealth(function(error, results) {
    if(error) {
      res.status(500);
    }
    res.json(results);
  })
});

module.exports = router;