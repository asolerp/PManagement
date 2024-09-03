const sendPushNotificationUpdateIncidence = require('./sendPushNotificationUpdateIncidence');
const sendPushNotificationNewIncidenceMessage = require('./sendPushNotificationNewIncidenceMessage');
const sendPushNotificationNewIncidence = require('./sendPushNotificationNewIncidence');
const sendPushNotificationAsignedIncidence = require('./sendPushNotificationAsignedIncidence');

module.exports = {
  sendPushNotificationUpdateIncidence,
  sendPushNotificationAsignedIncidence,
  sendPushNotificationNewIncidenceMessage,
  sendPushNotificationNewIncidence
};
