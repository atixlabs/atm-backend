'use strict';

import { HTTP } from 'meteor/http';
import { build_tx, push_tx, transfer_tokens, get_balance } from '../imports/server/blockchain_tools';
import Users from '../imports/collections/users';
import TransferEvents from '../imports/collections/transfer_events';
import BankAPI from './bank_api';

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
    if(!user){
      // TODO: this should be done on register instead
      const bankUserData = BankAPI.getUserData(/* user credentials*/);
      const newUserId = Users.insert({
        "address" : address,
        "email" : bankUserData.email,
        "personalInformation" : {
          "name": bankUserData.name,
          "fullName": bankUserData.name + " " + bankUserData.surname,
          "phone": bankUserData.phone,
          "birthdate": bankUserData.birthdate
        },
        "appSettings" : {},
        "appData" : {
          "maxAllowedWithdrawal" : bankUserData.maxAllowedWithdrawal
        }
      })

      // If user has never received tokens from backend, it means it's a new account and needs maxAllowedWithdrawal tokens
      const accountInitializationEvent = TransferEvents.findOne({from: Meteor.settings.backendWallet.address, to: address});
      if (!accountInitializationEvent) {
        console.log(`User ${address} has never received initial tokens, granting him ${bankUserData.maxAllowedWithdrawal}`);
        transfer_tokens(Meteor.settings.backendWallet.address, address, bankUserData.maxAllowedWithdrawal);
        console.log(`User ${address} received maxAllowedWithrawl tokens`);
      }

      return Users.findOne(newUserId);
    }
    return user;
  });
}

function user_balance(params, req, res) {
  console.log(`user_balance`);

  toJson(res, () => {
    const address = params.address;
    console.log(`user_balance by address ${address}`);
    if (!address) {
      throw new Meteor.Error(403, 'Missing address');
    }
    return get_balance(address);
  });
}

module.exports = {
  healthcheck: healthcheck,
  tx_push: tx_push,
  tx_build: tx_build,
  user_get: user_get,
  user_balance: user_balance
}
