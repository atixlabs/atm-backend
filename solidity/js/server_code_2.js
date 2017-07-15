'use strict';

const {
  promisify
} = require('util');

const crypto = require('crypto');

const util = require('ethereumjs-util');
const Web3 = require("web3");
const BigNumber = require("bignumber.js")
const contract = require("truffle-contract");

const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');
const EthereumTx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet')
var txutils = lightwallet.txutils
var signing = lightwallet.signing

const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider);

// Step 1: Get a contract into my application
const json = require("../build/contracts/AtmToken.json");
// Step 2: Turn that contract into an abstraction I can use

async function createWallet() {
  const randomBytes = crypto.randomBytes(16);
  const mnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'));
  const seed = bip39.mnemonicToSeed(mnemonic);
  const ethKey = hdkey.fromMasterSeed(seed);
  const wallet = ethKey.getWallet();
  return {
    mnemonic: mnemonic,
    privateKey: wallet.getPrivateKeyString(),
    publicKey: wallet.getPublicKeyString()
  }
};

async function preloadedWallet() {
  return {
    mnemonic: "corn buzz endorse wagon pitch seek shield tongue kind measure fun use",
    privateKey: "0x424525f3f6def569df3d97b0d06238e776f2670c853f32c5c029c1622403b8f2",
    publicKey: "0x9fc28d4cf6dcfd9221b291129689ab75edba1a92819de74521a9af8a92c4f952206797c1a9444fec636bc43384804a768f8e50a060b9cae5195bacdba0ef500b",
  }
}

async function loadAtmContract() {
  const Atm = contract(json);
  Atm.setProvider(provider);
  const atmContract = await Atm.deployed();
  const totalSupply = await atmContract.totalSupply();
  console.log(`Contract supply ${totalSupply.toString()}`);
  return atmContract;
}

async function sendTx(signedTransactionData) {
  const txHash = web3.eth.sendRawTransaction(signedTransactionData);
  return txHash
}

async function main() {
  const {
    mnemonic,
    privateKey,
    publicKey,
    wallet
  } = await preloadedWallet(); /*await createWallet()*/;

  const owner = util.bufferToHex(util.publicToAddress(publicKey));
  const receiver = "0x00c376412f3a8063fc6bceb1d874730ea88eb531";

  console.log(`Sender is ${owner} and receiver is ${receiver}`);

  
  const atm = await loadAtmContract();

  const senderBalance = await atm.balanceOf(owner);
  const receiverBalance = await atm.balanceOf(receiver);

  console.log(`senderBalance is ${senderBalance} and receiverBalance is ${receiverBalance}`);

  const txOptions = {
    gasPrice: 10,
    gasLimit: 47123880000,
    value: 0,
    to: atm.address,
    nonce: web3.eth.getTransactionCount(util.addHexPrefix(owner)), // we need to set correct nonce
  };
  console.log(`Contract is located at ${atm.address}`)

  var rlpTx = txutils.functionTx(atm.abi, 'transfer', [receiver, 100], txOptions);
  const tx = new EthereumTx(Buffer.from(util.stripHexPrefix(rlpTx), 'hex'));
  tx.sign(Buffer.from(util.stripHexPrefix(privateKey), 'hex'));
  const signedTx = tx.serialize();
  await sendTx(signedTx);
  
  const senderBalance2 = await atm.balanceOf(owner);
  const receiverBalance2 = await atm.balanceOf(receiver);
  console.log(`senderBalance is ${senderBalance2} and receiverBalance is ${receiverBalance2}`);
}

main().catch(err => console.log(err));