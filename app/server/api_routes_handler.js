'use strict';

import { HTTP } from 'meteor/http';
import { build_tx, push_tx, transfer_tokens, get_balance } from '../imports/server/blockchain_tools';
import Users from '../imports/collections/users';
import TransferEvents from '../imports/collections/transfer_events';
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
      error: exception,
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
    const { signed_tx, from, to, amount } = req.body;
    if (!signed_tx || !from || !to || !amount) {
      throw new Meteor.Error(403, 'Malformed request body, missing signed_tx');
    }
    const user = Users.findByAddress(from);
    if(!user){
      throw new Meteor.Error(400, `No User found for address: ${from}`);
    }
    const request = Requests.findOne({ requestUserId: user._id, state: 'pending'});
    if(!request){
      throw new Meteor.Error(400, `No pending request found for user with address: ${from}`);
    }

    const tx_hash = push_tx(signed_tx);
    if(tx_hash){
      const result = Requests.update({ _id : request._id },
          { $set: { state : 'confirmed',
            transactionData: {
              transactionHash: tx_hash,
              senderAddress: from,
              receiverAddress: to,
              amount: amount,
              state: 'emitted'
            }
          }}
      );
      console.error("failed to update request");
      if (result == 0) {
        throw new Meteor.Error(400, `Error updating the Request ${result}, req_id: ${request._id}`);
      }
    } else {
      throw new Meteor.Error(400, `Error pushing the Transaction`);
    }
    return { message : "transaction pushed", tx_hash: tx_hash};
  });
}

function user_register(params, req, res) {

  console.log(`user_register`);

  toJson(res, () => {
    const { username, password, address, oneSignalId } = req.body;

    if (!username || !password || !address || !oneSignalId) {
      throw new Meteor.Error(403, 'Missing data, expected { username, password, address, oneSignalId}');
    }
    const user = Users.findByAddress(address);
    if(user){
      throw new Meteor.Error(400, `User already register for address: ${address}`);
    }

    const bankUserData = BankAPI.getUserData({username: username, password: password});
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
        "oneSignalId": oneSignalId,
        "maxAllowedWithdrawal" : bankUserData.maxAllowedWithdrawal
      }
    });

	// If user has never received tokens from backend, it means it's a new account and needs maxAllowedWithdrawal tokens
	const accountInitializationEvent = TransferEvents.findOne(
        {from: Meteor.settings.backendWallet.address, to: address});
	if (!accountInitializationEvent) {
	  console.log(`User ${address} has never received initial tokens, granting him ${bankUserData.maxAllowedWithdrawal}`);
	  transfer_tokens(Meteor.settings.backendWallet.address, address, bankUserData.maxAllowedWithdrawal);
	  console.log(`User ${address} received maxAllowedWithrawl tokens`);
	}

    return Users.findOne(newUserId);
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
      throw new Meteor.Error(400, 'User not found, try registering first');
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

    // Add user data if retailUserId
    _.each(requestList, (it)=>{
      if(it.state === 'pending'){
        it.retailUser = Users.findOne(it.retailUserId);
      }
    })

    return requestList;
  });
}

function req_accept(params, req, res) {

  console.log(`req_accept`);

  toJson(res, () => {
    const { address, requestId } = req.body;
    if (!address || !requestId) {
      throw new Meteor.Error(403, 'Malformed request body, expected { address, requestId}');
    }
    const user = Users.findByAddress(address);
    if (!user) {
      throw new Meteor.Error(400, `No user found with address: ${address}`);
    }
    const request = Requests.find(requestId);

    //TODO: validate with bank api/contract if this user can fulfill this order

    const result = Requests.update({ _id : requestId },
        { $set: { state : 'pending', retailUserId : user._id }}
    );
    if (result == 0) {
      throw new Meteor.Error(400, `No request found with id: ${requestId}`);
    }
    console.log(`req_accept: request[${requestId}}] accepted by User with address ${address}`);
    return { message : "request accepted" };
  });
}

module.exports = {
  healthcheck: healthcheck,
  tx_push: tx_push,
  tx_build: tx_build,
  user_register: user_register,
  user_get: user_get,
  user_balance: user_balance,
  req_emit: req_emit,
  req_list: req_list,
  req_accept: req_accept
};
