'use strict';

import { HTTP } from 'meteor/http'
import { build_tx, push_tx } from '../imports/server/blockchain_tools'
import Users from '../imports/collections/users';
import Requests from '../imports/collections/requests';
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
      return Users.findOne(newUserId);
    }
    return user;
  });
}

function req_emit(params, req, res) {

  console.log(`req_emit`);

  toJson(res, () => {
    const { address, amount , location } = req.body;
    if (!address || !amount) {
      throw new Meteor.Error(403, 'Malformed request body, expected { address, amount}');
    }
    const user = Users.findByAddress(address);
    if (!user) {
      throw new Meteor.Error(400, `No user found with address: ${address}`);
    }
    //TODO: this should be validated by the bank API
    if(amount > user.appData.maxAllowedWithdrawal){
      throw new Meteor.Error(400, `Cannot request more than : ${user.appData.maxAllowedWithdrawal}`);
    }
    const requestId = Requests.insert({
      requestUserId: user._id,
      requestedAmount: amount
    });
    //TODO: emit push notifications to retailers

    return { message : "request emitted", requestId: requestId};
  });
}


function req_list(params, req, res) {

  console.log(`req_list`);

  toJson(res, () => {
    const address = params.address;
    console.log(`req_list for address ${address}`);
    if (!address) {
      throw new Meteor.Error(403, 'Missing address');
    }
    const user = Users.findByAddress(address);
    if (!user) {
      throw new Meteor.Error(400, `No user found with address: ${address}`);
    }
    const requestList = Requests.find(
        { $or: [
          { requestUserId: user._id} ,
          { retailUserId: user._id}]
        }).fetch();

    return requestList;
  });
}

module.exports = {
  healthcheck: healthcheck,
  tx_push: tx_push,
  tx_build: tx_build,
  user_get: user_get,
  req_emit: req_emit,
  req_list: req_list
}
