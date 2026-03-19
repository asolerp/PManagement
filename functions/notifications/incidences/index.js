const sendPushNotificationUpdateIncidence = require('./sendPushNotificationUpdateIncidence');
const sendPushNotificationNewIncidenceMessage = require('./sendPushNotificationNewIncidenceMessage');
const sendPushNotificationNewIncidence = require('./sendPushNotificationNewIncidence');
const sendPushNotificationAsignedIncidence = require('./sendPushNotificationAsignedIncidence');
const { incidentStateUpdatedAt } = require('./incidentStateUpdatedAt');
const {
  scheduledIncidenceReminders
} = require('./scheduledIncidenceReminders');

module.exports = {
  sendPushNotificationUpdateIncidence,
  sendPushNotificationAsignedIncidence,
  sendPushNotificationNewIncidenceMessage,
  sendPushNotificationNewIncidence,
  incidentStateUpdatedAt,
  scheduledIncidenceReminders
};
