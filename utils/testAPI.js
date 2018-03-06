var request = require('request');

function testAPI(token, callback) {
  request.post({
    uri: "https://slack.com/api/auth.test",
    qs: {token: token}
  }, function(e, r, b) {
    if(e) {
      console.log(e);
    } else {
      if(b && JSON.parse(b).ok) {
        callback(true);
      } else {
        callback(false);
      }
    }
  });
};

module.exports = testAPI;