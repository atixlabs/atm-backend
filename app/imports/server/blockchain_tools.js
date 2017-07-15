'use strict';

import util from 'ethereumjs-util';
import Web3 from "web3";

import contract from 'truffle-contract';

import EthereumTx from 'ethereumjs-tx';
import lightwallet from 'eth-lightwallet';

import {
  Meteor
} from 'meteor/meteor';

import {
  Promise
} from 'meteor/promise';

const txutils = lightwallet.txutils
const signing = lightwallet.signing

const provider = new Web3.providers.HttpProvider(Meteor.settings.ETH_NODE_URL)
const web3 = new Web3(provider);

// Step 1: Get a contract into my application
// TODO: load contract from somewhere else
import contract_json from "../../server/AtmToken.json";

// Step 2: Turn that contract into an abstraction I can use
function loadAtmContract() {
  const Atm = contract(contract_json);
  Atm.setProvider(provider);
  const atmContract = Promise.await(Atm.deployed());
  const totalSupply = Promise.await(atmContract.totalSupply());
  console.log(`Contract supply ${totalSupply}`);
  return atmContract;
}

// Load contract info and ABI in order to be ablel to use it
const atm = loadAtmContract();

export function build_tx(from, to, amount) {

  console.log(`Sender is ${from} and receiver is ${to}, amount is ${amount}`);
  // Check balances before doing anything
  const senderBalance = Promise.await(atm.balanceOf(from));
  const receiverBalance = Promise.await(atm.balanceOf(to));
  console.log(`senderBalance is ${senderBalance} and receiverBalance is ${receiverBalance}`);

  // Create transaction options, this should probably be in a settings file.
  const txOptions = {
    gasPrice: 10,
    gasLimit: 47123880000, //FIXME there is an RPC method to estimate gas
    value: 0,
    to: atm.address,
    nonce: web3.eth.getTransactionCount(util.addHexPrefix(from)), // getting transaction count is the same as querying for latest nonce
  };

  // This is where contract is located. It's extracted from contract Object
  console.log(`Contract is located at${atm.address}`)

  // Create a contract call function which will invoke transfer method with params "receiver" and 100
  // The result is RLP serialized
  const rlpTx = txutils.functionTx(atm.abi, 'transfer', [to, amount], txOptions);

  return rlpTx;
}

export function push_tx(signedTx) {
  const txHash = web3.eth.sendRawTransaction(signedTx);
  return txHash
}

export function get_historic_events(from, to = "latest", cb) {
  const allEvents = atm.allEvents({fromBlock: from, toBlock: to});
  allEvents.get(Meteor.bindEnvironment(cb))
}

export function watch_events(cb) {
  atm.allEvents().watch(Meteor.bindEnvironment(cb));
} 