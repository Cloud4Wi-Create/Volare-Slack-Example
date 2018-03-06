/*jshint esversion: 6 */

var Request = require('request');

var constructMessage = function(user, settings) {
  var fields = [];

  for(var fieldId in settings.fields) {
      var field = settings.fields[fieldId];
      if(field.value == undefined || field.value == "undefined" || field.value == "") {
        field.value = "firstName";
      }
      fields.push({
          title: field.title,
          value: user[field.value],
          short: true
      });
  }

  var message = {
      attachments: [
          {
              color: settings.color,
              pretext: settings.pretext,
              fallback: settings.fallback,
              title: settings.title,
              fields
          }
      ]
  };
  
  console.log(message.attachments[0].fields);
  
  return message;
};

var sendMessage = function(user, settings, url, responseCallback) {
  var options = {
      url: url,
      headers: {'content-type': 'application/json'},
      method: 'POST',
      body: constructMessage(user, settings),
      json: true
  };
  var callback = function(error, response, body) {
    if(error) {
      console.log(error);
      responseCallback("error");
    } else if(response.statusCode == '200') {
      responseCallback("success");
    } else {
      responseCallback("error");
    }
  };

  Request(options, callback);
};

module.exports = sendMessage;