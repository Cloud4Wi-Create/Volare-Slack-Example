var express = require('express');
var router = express.Router();

var Request = require('request');
var mysql = require('../utils/data-handler');

router.post('/', function(req, res, next) {
  var eventWrapper = req.body;
  console.log("Event received: ", eventWrapper);

  if(eventWrapper.type === 'event_callback') {
    var event = eventWrapper.event;
    if(event.type == 'tokens_revoked') {
      console.log('tokens_revoked event received', event);
      // Do stuff here
    }
    res.json({status: 'success'});
  } else {
    res.json({'challenge': eventWrapper.challenge});
  }
});

module.exports = router;