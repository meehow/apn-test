'use strict';

var apn = require('apn');
var _ = require('lodash');

module.exports = function(message, options, callback){
  var defaultOptions = {
    cert: 'cert.pem',
    key: 'key.pem',
    fastMode: true,
    production: true,
    connectionTimeout: 1000
  };
  options = _.defaults(options, defaultOptions);
  callback = callback || _.noop;

  if(_.isEmpty(options.token)){
    throw new Error('Device token is required');
  }

  var device;
  if(_.isArray(options.token)){
    device = options.token.map(function(token) {
      return new apn.Device(token);
    });
  } else {
    if(options.token.length !== 64){
      throw new Error('Device token should be 64 characters');
    }

    device = new apn.Device(options.token);
  }

  var connection = new apn.Connection(options);
  var notification = new apn.Notification();

  notification.alert = message || 'Hello world!';
  notification.badge = options.badge || 0;
  notification.sound = options.sound || 'ping.aiff';
  notification.payload = options.payload || {};
  notification.expiry = options.expiry || Math.floor(Date.now() / 1000) + 3600;

  connection.pushNotification(notification, device);

  return callback(connection);
};
