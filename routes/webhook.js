var express = require('express');
var router = express.Router();

var mysql = require('../utils/data-handler');

var sendMessage = require('../utils/webhook-message');

function sendWebhook(user) {
  // Add custom fields to User
  // Full Name
  user.fullName = user.firstName + " " + user.lastName;

  // Birthdate and Age
  if(user.birthDate) {
      var birthdate = new Date(user.birthDate);
      var ageDate = new Date(Date.now() - birthdate.getTime());
      user.age = Math.abs(ageDate.getUTCFullYear() - 1970);
      user.birthDate = birthdate.toISOString().split('T')[0];
  }

  // Gender
  if(['m', 'male', 'Male', 'MALE'].includes(user.gender)) {
    user.gender = 'Male';
  } else if(['f', 'F', 'female', 'Female', 'FEMALE'].includes(user.gender)) {
    user.gender = 'Female';
  } else if(['Other', 'other'].includes(user.gender)) {
    user.gender = 'Other';
  }

  var numChecks = 0;
  var overallIsNew = false;
  var urls = [];
  var settingss = [];
  var venues = [];

  if(user.venueId === 'undefined' || user.venueId === undefined || user.venueId === 0 || user.venueId === '0') {
    numChecks = 1;
    venues = [0];
  } else {
    venues = [user.venueId, 0];
  }

  function curriedCheckNew(url, settings, isNewResult) {
    numChecks++;
    urls.push(url);
    settingss.push(settings);

    if(isNewResult) {
      overallIsNew = true;
    }

    if(numChecks == 2) {
      if(overallIsNew) {
        for(var i = 0; i < 2; i++) {
          if(urls[i]) {
            if(settingss[i].events === undefined || settingss[i].events.includes(user.event)) {
              sendMessage(user, settingss[i], urls[i], function(s) {});
            } else {
              // console.log("Event " + user.event + " disabled in settings");
            }
          } else {
            // console.log("no slack set up");
          }
        }
      } else {
        // console.log("User " + user.userId + " is already here");
      }
    }
  }

  // console.log('webhook received: ', user.userId, user.tenantId, user.venueId);
  for(var i = 0; i < venues.length; i++) {
    mysql.getSettings(user.tenantId, venues[i], function(error, settings, auth) {
      mysql.isNewVisit(user.tenantId, user.venueId, user.userId, settings.timeout || 10, function(error, isNew) {
        if(error && error.code != "ER_DUP_ENTRY") {
          // console.log("Error checking user timestamp", error);
        } else {
          curriedCheckNew(auth.url, settings, isNew);
        }
      });
    });
  }
};


/*  */
router.post('/', function(req, res, next) {
  var user = req.body;

  // console.log("Webhook received for " + user.firstName + ", event type: " + user.event);

  if(user.deleted === undefined || user.deleted === "false" || user.deleted === false) {
    sendWebhook(user);
  } else {  
    // console.log('Webhook recieved for deleted user ', user.userId);
  }
  res.json({status: "webhook received"});
});


module.exports = router;