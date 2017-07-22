'use strict';

import { HTTP } from 'meteor/http'
import { build_tx, push_tx } from '../imports/server/blockchain_tools'
import Users from '../imports/collections/users';

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
    const rlpTx = build_tx(from, to, amount);
    return Object.assign({}, req.body, { raw_tx: rlpTx});
  });
}

function tx_push(params, req, res) {

  console.log(`txs_push`);

  toJson(res, () => {
    const { signed_tx, from, to } = req.body;
    if (!signed_tx) {
      throw new Meteor.Error(403, 'Malformed request body, missing signed_tx');
    }
    const tx_hash = push_tx(signed_tx);
    return { message : "transaction pushed", tx_hash: tx_hash};
  });
}

function user_get(params, req, res) {

  console.log(`user_get`);

  toJson(res, () => {
    const address = params.address;
    console.log(`user_get by address ${address}`);
    if (!address) {
      throw new Meteor.Error(403, 'Missing address');
    }
    const user = Users.findByAddress(address);
    return user;
  });
}

module.exports = {
  healthcheck: healthcheck,
  tx_push: tx_push,
  tx_build: tx_build,
  user_get: user_get
}
