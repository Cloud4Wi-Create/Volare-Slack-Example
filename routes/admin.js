var express = require('express');
var router = express.Router();

var Request = require('request');
var mysql = require('../utils/data-handler');

var testAPI = require('../utils/testAPI');

var contextUrl = process.env.CONTEXT_ENDPOINT;

/* GET home page. */
router.get('/', function(req, res, next) {
  var sessionKey = req.query.sk;

  Request.get(contextUrl + sessionKey, function(error, response, body) {
    var tenantId = 0;
    var venueId = 0;

    if(typeof body != 'object') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        console.error("unable to parse body from " + contextUrl + sessionKey + "\n\t" + body);
      }
    }

    if(error) {
      console.log("Context API Error: ", error);
    } else {
      if(response.statusCode == '200' && body.status == 'success') {
        tenantId = body.data.auth.tenantId || 0;
        venueId = body.data.auth.wifiareaId || 0;
      } else {
        console.log("Context API returned an Error: ", response.statusCode);
      }
    }

    mysql.getSettings(tenantId, venueId, function(error, settings, auth) {
      if(tenantId && venueId) {
        res.cookie('tenantId', tenantId);
        res.cookie('venueId', venueId);
      }
      auth = auth || {};
      if(auth.token) {
        testAPI(auth.token, function(success) {
          if(success) {
            res.render('admin', { title: 'Settings' , settings: settings, channel: auth.channel, tenantId: tenantId, venueId: venueId });
          } else {
            mysql.setAuth(tenantId, venueId, {token: "", url: "", channel: "", configUrl: "", channel_id: ""}, function(error) {
              if(error) {
                console.log("Error resetting Authentication", error);
              }
              res.render('admin', { title: 'Settings' , settings: settings, channel: undefined, tenantId: tenantId, venueId: venueId });
            });
          }
        });
      } else {
        res.render('admin', { title: 'Settings' , settings: settings, channel: auth.channel, tenantId: tenantId, venueId: venueId });
      }
    });
  });
});

router.post('/', function(req, res, next) {
  var settings = req.body;
  var tenantId = req.query.tenantId;
  var venueId = req.query.venueId;

  mysql.setSettings(tenantId, venueId, settings, function(error, results) {
    if(error) {
      res.json({success: false});
    } else {
      res.json({success: true, settings: results});
    }
  });
});

router.get('/settings', function(req, res, next) {
  var tenantId = req.query.tenantId;
  var venueId = req.query.venueId;

  mysql.getSettings(tenantId, venueId, function(error, settings, auth) {
      res.json(settings);
  });
});

module.exports = router;