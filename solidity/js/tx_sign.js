var lightwallet = require('eth-lightwallet')
var txutils = lightwallet.txutils
var signing = lightwallet.signing
var encryption = lightwallet.encryption

const signTx = (tx, password) => {
  lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {

    var keystore = new lightwallet.keystore(seed, pwDerivedKey)
    keystore.generateNewAddress(pwDerivedKey)

    var sendingAddr = keystore.getAddresses()[0]

    var contractData = txutils.createContractTx(sendingAddr, tx)
    var signedTx = signing.signTx(keystore, pwDerivedKey, contractData.tx, sendingAddr)

    console.log('Signed Contract creation TX: ' + signedTx)
    console.log('')
    console.log('Contract Address: ' + contractData.addr)
    console.log('')

    // TX to register the key 123
    txOptions.to = contractData.addr
    txOptions.nonce += 1
    var registerTx = txutils.functionTx(abi, 'register', [123], txOptions)
    var signedRegisterTx = signing.signTx(keystore, pwDerivedKey, registerTx, sendingAddr)

    // inject signedRegisterTx into the network...
    console.log('Signed register key TX: ' + signedRegisterTx)
    console.log('')

    // TX to set the value corresponding to key 123 to 456
    txOptions.nonce += 1
    var setValueTx = txutils.functionTx(abi, 'setValue', [123, 456], txOptions)
    var signedSetValueTx = signing.signTx(keystore, pwDerivedKey, setValueTx, sendingAddr)

    // inject signedSetValueTx into the network...
    console.log('Signed setValueTx: ' + signedSetValueTx)
    console.log('')

    // Send a value transaction
    txOptions.nonce += 1
    txOptions.value = 1500000000000000000
    txOptions.data = undefined
    txOptions.to = 'eba8cdda5058cd20acbe5d1af35a71cfc442450e'
    var valueTx = txutils.valueTx(txOptions)

    var signedValueTx = signing.signTx(keystore, pwDerivedKey, valueTx, sendingAddr)
    console.log('Signed value TX: ' + signedValueTx)
    console.log('')

  })
}

module.exports = {
  signTx: signTx
}