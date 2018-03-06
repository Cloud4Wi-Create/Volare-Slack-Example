/*jshint esversion: 6 */

var mysql = require('mysql');
var database = process.env.MYSQL_DATABASE || "slack_webhook";

// ----------------------------------------------------------------------------------------------------
// Set up Redis Cache
// ----------------------------------------------------------------------------------------------------
var redis = require('redis');
var redisClient = redis.createClient(process.env.REDIS_URL);
var redisErrors = null;

redisClient.on('error', function (err) {
  console.log("Redis Error " + err);
  redisErrors = err;
});

// ----------------------------------------------------------------------------------------------------
// Set up MySql Pool
// ----------------------------------------------------------------------------------------------------
var connectionLimit = process.env.MYSQL_MAX_CONNECTIONS || 1;
if (connectionLimit > 10) connectionLimit = 9;

var pool = mysql.createPool({
  connectionLimit: connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT || 3306,
  database: database
});

var mysqlErrors = [];

pool.on('error', function (error) {
  console.log(error);
  mysqlErrors.push(error);
});

// ----------------------------------------------------------------------------------------------------
// Saving Settings
// ----------------------------------------------------------------------------------------------------
var setSettings = function (tenantId, venueId, settings, callback) {
  if (tenantId === 'undefined' || tenantId === undefined) tenantId = 0;
  if (venueId === 'undefined' || venueId === undefined) venueId = 0;
  if (typeof settings !== 'string') settings = JSON.stringify(settings);
  var insertSettings = 'INSERT INTO settings (tenantID, venueID, settings) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE settings=VALUES(settings)';

  // Connect to mySql
  pool.query(insertSettings, [tenantId, venueId, settings], function (error, results, fields) {
    callback(error, results ? results[0] : null);
    if (!error) redisClient.set('' + tenantId + venueId, '', 'EX', 3600);
  });
};


// ----------------------------------------------------------------------------------------------------
// Saving last visit time for user
// ----------------------------------------------------------------------------------------------------
var isNewVisit = function (tenantId, venueId, userId, timeout, callback) {
  if (tenantId === 'undefined' || tenantId === undefined) tenantId = 0;
  if (venueId === 'undefined' || venueId === undefined) venueId = 0;

  var key = '' + tenantId + venueId + userId;

  redisClient.get(key, function (err, reply) {
    if (err) console.log(err);
    callback(err, !reply);
    if (timeout > 0) redisClient.set(key, 'true', 'EX', timeout * 60);
  });
};

// ----------------------------------------------------------------------------------------------------
// Saving Auth Settings
// ----------------------------------------------------------------------------------------------------
var setAuth = function (tenantId, venueId, auth, callback) {
  if (tenantId === 'undefined' || tenantId === undefined) tenantId = 0;
  if (venueId === 'undefined' || venueId === undefined) venueId = 0;

  // Connect to mySql
  pool.query('SELECT * from settings WHERE tenantID=? AND venueID=?', [tenantId, venueId], function (error, results, fields) {
    if (error) {
      callback(error);
    } else {
      // save old token to be passed back and destroyed
      var oldAuth = (results && results[0]) ? results[0].token : null;

      pool.query('INSERT INTO settings (tenantID, venueID, token, URL, configURL, channel, channelID) VALUES (?, ?, ?, ?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE token=VALUES(token), URL=VALUES(URL), configURL=VALUES(configURL), channel=VALUES(channel), channelID=VALUES(channelID);',
        [tenantId, venueId, auth.token, auth.url, auth.configUrl, auth.channel, auth.channelId], function (e, results, fields) {

          // pass back old token to be destroyed if it exists
          callback(e, oldAuth);
          if (!e) redisClient.set('' + tenantId + venueId, '', 'EX', 3600);
        });
    }
  });
};

// ----------------------------------------------------------------------------------------------------
// Retrieving Settings for Auth and/or Messaging
// ----------------------------------------------------------------------------------------------------
var getSettings = function (tenantId, venueId, callback) {
  if (tenantId === 'undefined' || tenantId === undefined) tenantId = 0;
  if (venueId === 'undefined' || venueId === undefined) venueId = 0;
  // Relevant Queries
  var findByIds = 'SELECT * FROM settings WHERE tenantID=? AND venueID=?;';
  var defaultSettings = {
    title: "An Event was received",
    pretext: "",
    fallback: "An Event was received",
    color: "#000055",
    timeout: 10,
    fields: {
      0: { id: 0, title: "Name", value: "fullName" },
      1: { id: 1, title: "Email", value: "email" },
      2: { id: 2, title: "Event Type", value: "event" }
    }
  };

  // redis client key
  var key = '' + tenantId + venueId;

  // console.log('getting settings for venue: ' + venueId + ' and tenant ' + tenantId);
  redisClient.get(key, function (err, reply) {
    if (err) {
      console.log(err);
    } else {
      if (reply) {
        reply = JSON.parse(reply);
        callback(reply.error, reply.settings, reply.auth);
      } else {
        // Connect to mySql
        pool.query(findByIds, [tenantId, venueId], function (error, results) {
          if (error) console.log(error);

          // Parse Settings
          var settings = defaultSettings;
          if (results[0] && results[0].settings) settings = JSON.parse(results[0].settings.toString('utf-8'));

          // Parse Auth Items
          var auth = {};
          if (results[0]) {
            auth = {
              token: results[0].token,
              url: results[0].URL,
              configUrl: results[0].configURL,
              channel: results[0].channel,
              channelId: results[0].channelID
            };
          }

          // Return Results
          var value = error ? JSON.stringify({ error: error }) : JSON.stringify({ settings: settings, auth: auth });
          redisClient.set(key, value, 'EX', 3600);
          callback(error, settings, auth);
        });
      }
    }
  });


};

// ----------------------------------------------------------------------------------------------------
// Health Checker
// ----------------------------------------------------------------------------------------------------

var checkHealth = function (callback) {
  var results = {
    mySQL: false,
    mySQLErrors: mysqlErrors,
    redis: false
  }
  mysqlErrors = [];
  var error = false;
  pool.getConnection(function (sqlError, connection) {
    connection.release();
    if (sqlError) {
      results.mySQL = sqlError.message;
      error = true;
    } else {
      results.mySQL = "OK";
    }
    if (redisClient.connected) {
      results.redis = "OK";
    } else {
      results.redis = redisErrors;
      error = true;
    }
    callback(error, results);
  });
};

module.exports = {
  setSettings,
  getSettings,
  setAuth,
  isNewVisit,
  checkHealth
};
