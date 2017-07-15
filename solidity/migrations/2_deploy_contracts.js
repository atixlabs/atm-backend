var Atm = artifacts.require("./AtmToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Atm);
};