'use strict';

const {
  promisify
} = require('util');

const util = require('ethereumjs-util');
const Web3 = require("web3");
const BigNumber = require("bignumber.js")
const contract = require("truffle-contract");

var lightwallet = require('eth-lightwallet')
var txutils = lightwallet.txutils
var signing = lightwallet.signing

const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider);

// Step 1: Get a contract into my application
const json = require("../build/contracts/AtmToken.json");
// Step 2: Turn that contract into an abstraction I can use

async function createKeysStore(password) {
  const ks = await promisify(lightwallet.keystore.createVault).bind(lightwallet.keystore)({
    password,
    seed: "tank solar pause fossil lake crazy effort husband stand salmon happy loan",
    salt: "fixed",
  });
  const keyFromPassword = promisify(ks.keyFromPassword).bind(ks);
  

  return {
    pwDerivedKey,
    ks
  }
};

async function preloadedKeyStore(password) {
  const ks = lightwallet.keystore.deserialize('{"encSeed":{"encStr":"HjRITEUb2lFpr95sw1ZGdmazP/D9If4qBJSiZN34MT2h9Hz4ISvRQ6XhSSodJcwLAeNkutJa2z7Cj3aRGCY0CyRUWP1MObhcwjpeWTGfAfEm15mxRz/5o+iaeSzCJoyN2pQOH/ohTpLOmEhl1xcSnLOpg0efswfunK2KTcYU1w6xfFmFnp8bCQ==","nonce":"V8+QPGaUylsQ4MGKRM0V61MG44Nu17QF"},"ksData":{"m/0\'/0\'/0\'":{"info":{"curve":"secp256k1","purpose":"sign"},"encHdPathPriv":{"encStr":"cqRWlr071hUg85u7rC9RjW+pGYcdajzTsaJvklT2b41YXsj0B0rUTKuDvAw4ClLwjW71pUo/FC0OmafTEhVPZ7ToCObTS4hx20PQH8aVHtVpU3mbMLbRvkJ6XjsBxHEK2A8yHcuQO/WeUmGOQgDoMVCSw0P/SG0BUj2YOMSWzA==","nonce":"JX1lfeR4H807nHXUvv+XAiN9eLKg3PUX"},"hdIndex":1,"encPrivKeys":{"99101d6bfbf8f7a58ad6f2e1ecd289df42fe6039":{"key":"kDr6c8NXbbd413qk+QCO/MBH9QpIRrNd5wIgU/IJ/B43mfRCgtvMnWKb9Otqbpmu","nonce":"H9/0E9hV1Q1mLtsMsWLlVDK1Pl3Riu0R"}},"addresses":["99101d6bfbf8f7a58ad6f2e1ecd289df42fe6039"]}},"encHdRootPriv":{"encStr":"gKvDdSTFM0Ctedrq9urLhxpXcIGBpWhmOXJkTSoxlSh+8fqEaBl0+uF4Sw/rcR5sUyRmkgyhzQ/jrCKnHmskgBeYDsxF1EGpvVoJW3rTbSO39Qipvvyy0CruknhyP8ds+r4O3ojnsO9CtchHQMEcNGxUBDbk25CHTtNG3gO1pA==","nonce":"HOzJD5WD6lijQ55NUYhvRYCFUgjVEjft"},"salt":"fixed","version":2}')
  const keyFromPassword = promisify(ks.keyFromPassword).bind(ks);
  const pwDerivedKey = await keyFromPassword(password);
  return {
    pwDerivedKey,
    ks
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
  const password = "myPassword"
  
  const {
    pwDerivedKey,
    ks
  } = await preloadedKeyStore(password); //await createKeysStore(password);
  const atm = await loadAtmContract();

  ks.generateNewAddress(pwDerivedKey, 1);
  const owner = util.addHexPrefix(ks.getAddresses()[0]);
  const receiver = util.addHexPrefix(ks.getAddresses()[1]);

  console.log(`Sender owner is ${owner} and priv is ${ks.exportPrivateKey(owner, pwDerivedKey)}`);

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
  var tx = txutils.functionTx(atm.abi, 'transfer', [receiver, 100], txOptions);
  console.log(tx)
  var signedTx = signing.signTx(ks, pwDerivedKey, tx, util.stripHexPrefix(owner));
  console.log('Signed tx: ' + signedTx);

  await sendTx(signedTx);


  const senderBalance2 = await atm.balanceOf(owner);
  const receiverBalance2 = await atm.balanceOf(receiver);

  console.log(`senderBalance is ${senderBalance2} and receiverBalance is ${receiverBalance2}`);
}

main().catch(err => console.log(err));