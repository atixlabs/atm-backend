'use strict';

import util from 'ethereumjs-util';
import Web3 from "web3";

import contract from 'truffle-contract';

import EthereumTx from 'ethereumjs-tx';
import lightwallet from 'eth-lightwallet';

import { Promise } from 'meteor/promise';

const txutils = lightwallet.txutils
const signing = lightwallet.signing

const provider = new Web3.providers.HttpProvider(Meteor.settings.ETH_NODE_URL)
const web3 = new Web3(provider);

// Step 1: Get a contract into my application
//const contract_json = JSON.parse(Assets.getText("./AtmToken.json"));
import contract_json from "./AtmToken.json";
// Step 2: Turn that contract into an abstraction I can use

function preloadedWallet() {
    return {
        mnemonic: "corn buzz endorse wagon pitch seek shield tongue kind measure fun use",
        privateKey: "0x424525f3f6def569df3d97b0d06238e776f2670c853f32c5c029c1622403b8f2",
        publicKey: "0x9fc28d4cf6dcfd9221b291129689ab75edba1a92819de74521a9af8a92c4f952206797c1a9444fec636bc43384804a768f8e50a060b9cae5195bacdba0ef500b",
    }
}

function loadAtmContract() {
    const Atm = contract(contract_json);
    Atm.setProvider(provider);
    const atmContract = Promise.await(Atm.deployed());
    const totalSupply = Promise.await(atmContract.totalSupply());
    console.log(`Contract supply ${totalSupply}`);
    return atmContract;
}

function sendTx(signedTransactionData) {
    const txHash = web3.eth.sendRawTransaction(signedTransactionData);
    return txHash
}

function build_tx(from, to, amount) {
    const {
        mnemonic,
        privateKey,
        publicKey,
        } = preloadedWallet();

    const owner = from;
    const receiver = "0x00c376412f3a8063fc6bceb1d874730ea88eb531";

    console.log(`Sender is ${owner} and receiver is ${receiver}`);

    // Load contract info and ABI in order to be ablel to use it
    const atm = loadAtmContract();
    // Check balances before doing anything
    const senderBalance = Promise.await(atm.balanceOf(owner));
    const receiverBalance = Promise.await(atm.balanceOf(receiver));
    console.log(`senderBalance is ${senderBalance} and receiverBalance is ${receiverBalance}`);

    // Create transaction options, this should probably be in a settings file.
    const txOptions = {
        gasPrice: 10,
        gasLimit: 47123880000, //FIXME there is an RPC method to estimate gas
        value: 0,
        to: atm.address,
        nonce: web3.eth.getTransactionCount(util.addHexPrefix(owner)), // getting transaction count is the same as querying for latest nonce
    };

    // This is where contract is located. It's extracted from contract Object
    console.log(`Contract is located at ${atm.address}`)

    // Create a contract call function which will invoke transfer method with params "receiver" and 100
    // The result is RLP serialized
    var rlpTx = txutils.functionTx(atm.abi, 'transfer', [receiver, 100], txOptions);

    // Construct the EthereumTx based on serialized one
    const tx = new EthereumTx(Buffer.from(util.stripHexPrefix(rlpTx), 'hex'));

    // Sign and send!
    tx.sign(Buffer.from(util.stripHexPrefix(privateKey), 'hex'));
    const signedTx = tx.serialize();
    sendTx(signedTx);

    // Check balances again
    const senderBalance2 = Promise.await( atm.balanceOf(owner));
    const receiverBalance2 = Promise.await(atm.balanceOf(receiver));
    console.log(`senderBalance is ${senderBalance2} and receiverBalance is ${receiverBalance2}`);
    console.log(senderBalance2)
}

main()

module.exports = {
    run: main
}