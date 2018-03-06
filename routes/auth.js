var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var request = require('request');

var mysql = require('../utils/data-handler');
var testAPI = require('../utils/testAPI');

var clientId = process.env.SLACK_CLIENT_ID;
var clientSecret = process.env.SLACK_CLIENT_SECRET;

function revokeToken(token, callback) {
  var json = {token: token};
  console.log(json);
  if(token) {
    request.post({
      uri: "https://slack.com/api/auth.revoke", 
      qs: json
      }, function(e, r, b) {
      if(e) {
        console.log(e);
        callback(e);
      } else {
        console.log(r.statusCode, b);
        callback(b);
      }
    });
  }
}

/* Add to Slack Button, beginning OAUTH process */
router.get('/new', function(req, res, next) {
  var tenantId = req.query.tenantId;
  var venueId = req.query.venueId;

  var token = jwt.sign({tenantId: tenantId, venueId: venueId}, process.env.jwtSecret || "secret", { expiresIn: '1Hr' });
  console.log('state token: ', token);

  // Construct URL
  var url = "https://slack.com/oauth/authorize?scope=incoming-webhook&client_id=" + clientId;
  url += "&state=" + token;

  res.redirect(url);
});

/* Redirect URL from Slack */
router.get('/', function(req, res, next) {
  var code = req.query.code;
  var state = req.query.state;

  jwt.verify(state, process.env.jwtSecret || "secret", function(err, decoded) {
    if(err) {
      console.log('error with state from oauth');
      res.render('closewindow');
    } else {
      var url = "https://slack.com/api/oauth.access";
      url += "?code=" + code;
      url += "&client_id=" + clientId;
      url += "&client_secret=" + clientSecret;

      request.get(url, function(error, response, body) {
        if(error) {
          console.log("Error calling for oauth access token");
          res.render('closewindow');
        } else {
          body = JSON.parse(body);
          if(response.statusCode == '200' && body.ok) {
            console.log('Successful Callback from Slack!', body);
            var auth = {};
            if(body.incoming_webhook) {
              auth = {
                token: body.access_token,
                url: body.incoming_webhook.url,
                channel: body.incoming_webhook.channel,
                configUrl: body.incoming_webhook.configuration_url,
                channel_id: body.incoming_webhook.channel
              };
            }
            console.log("Saving auth information for tenant " + decoded.tenantId + " and venue " + decoded.venueId);
            mysql.setAuth(decoded.tenantId, decoded.venueId, auth, function(error, oldToken) {
              revokeToken(oldToken, function() {});
              res.render('closewindow');
            });
          } else {
            console.log("Error retrieving oauth access token");
            console.log(response.statusCode, body);
            res.render('closewindow');
          }
        }
      });
    }
  });
});

/* Remove from Slack */
router.delete('/', function(req, res, next) {
  var tenantId = req.query.tenantId;
  var venueId = req.query.venueId;

  mysql.getSettings(tenantId, venueId, function(e, u, auth) {
    if(auth.token) {
      revokeToken(auth.token, function(e, b) {
        mysql.setAuth(tenantId, venueId, {token: 0}, function(error) {
          if(error) console.log("ERROR Deleting Auth Info for " + tenantId + "/" + venueId, error);
          res.json({ok: true});
        });
      });
    } else {
      res.json({ok: false, message: "no token to revoke"});
    }
  });
});

router.get('/channel', function(req, res, next) {
  if(req.query.tenantId === undefined) {
    res.json({ok: false});
  } else {
    mysql.getSettings(req.query.tenantId, req.query.venueId, function(e, s, auth) {
      res.json({channel: auth.channel});
    });
  }
});

module.exports = router;
