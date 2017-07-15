'use strict';

import { HTTP } from 'meteor/http'
import { run } from './tx_helper.js'

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

function tx_build(params, req, res) {

  console.log(`tx_build`);

  toJson(res, () => {
    const { from, to, amount } = req.body;
    if (!from || !to || !amount) {
      throw new Meteor.Error(403, 'Malformed request body, expecting {from, to, amount}');
    }
    run()
    return { raw_tx : `This is a Tx for ${JSON.stringify(req.body)}` };
  });
}

function tx_push(params, req, res) {

  console.log(`txs_push`);

  toJson(res, () => {
    const { signed_tx, internal } = req.body;
    if (!signed_tx) {
      throw new Meteor.Error(403, 'Malformed request body, missing signed_tx');
    }
    if(!internal) {
      HTTP.call('POST', 'http://localhost:3000/api/v1/tx/push', {
        data: { signed_tx: signed_tx, internal: true },
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
  tx_push: tx_push,
  tx_build: tx_build
}
