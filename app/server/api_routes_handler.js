'use strict';

import { HTTP } from 'meteor/http'

function toJson(res, buildResultFn) {
  try {
    const result = buildResultFn();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (exception) {
    console.log("ERROR", exception);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: exception.reason,
      message: exception.details,
      errorType: exception.errorType
    }));
  }
}

function healthcheck(params, req, res) {

  console.log(`healthcheck`);

  toJson(res, () => {
    return {
      app_version: Meteor.settings.public.APP_VERSION,
      memory: process.memoryUsage(),
      pid: process.pid,
      gid: process.getgid(),
      uid: process.getuid(),
      uptime: process.uptime()
    };
  });
}

function tx_push(params, req, res) {

  console.log(`txs_push`);

  toJson(res, () => {
    const { raw_tx, internal } = req.body;
    if (!raw_tx) {
      throw new Meteor.Error(403, 'Malformed request body, missing raw_tx');
    }
    if(!internal) {
      HTTP.call('POST', 'http://localhost:3000/api/v1/tx/push', {
        data: { raw_tx: raw_tx, internal: true },
        headers: { 'Content-Type': 'application/json' }
      }, (error, result) => {
        if(!error) {
          console.log('transaction accepted', result);
        }
      });
    }
    return { message : "transaction pushed"};
  });
}

module.exports = {
  healthcheck: healthcheck,
  tx_push: tx_push
}
