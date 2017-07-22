import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

const oneSignalAPI = {};
const oneSignalUrl = Meteor.settings.oneSignal.API_URL;
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Authorization': `Basic ${Meteor.settings.oneSignal.API_AUTH}`
};

oneSignalAPI.notifyByPlayerId = function(missionId, playerIds, message) {
  const options = {};
  const buttons = [];

  buttons.push({
    id: "go_to_request",
    text: "Go to request"
  });

  options.headers = headers;
  options.data = {
    'app_id': Meteor.settings.oneSignal.APP_ID,
    'include_player_ids': playerIds,
    'contents': { 'en': message },
    'buttons': buttons,
    'data': { 'requestId': requestId },
  };

  HTTP.call('POST', oneSignalUrl, options, function(err, res) {
    if (err) {
      console.log('OneSignal player notifications error', err);
    } else {
      console.log('OneSignal player notifications', res);
    }
  });
};

export default oneSignalAPI;
