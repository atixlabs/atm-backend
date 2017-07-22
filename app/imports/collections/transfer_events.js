import {
  Mongo
} from 'meteor/mongo';

const TransferEvents = new Mongo.Collection('TransferEvents');

TransferEvents.findAllByAddress = address => {
  return TransferEvents.find({
    $or: [{
      from: address
    }, {
      to: address
    }]
  });
};

if (Meteor.isServer) {
  Meteor.publish('eventsByAddress', address => {
    check(address, String);
    return TransferEvents.findAllByAddress(address);
  });
}

export default TransferEvents;