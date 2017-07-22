import { Mongo } from 'meteor/mongo';

Requests = new Mongo.Collection('requests');

const transactionData = new SimpleSchema({
  transactionId: {
    type: String,
    optional: true,
  },
  amount: {
    type: Number,
    optional: true,
  },
  contractAddress: {
    type: String,
    optional: true,
  },
  senderAddress: {
    type: String,
    optional: true,
  },
  receiverAddress: {
    type: String,
    optional: true,
  },
  state: {
    type: String,
    optional: true,
    allowedValues: ['empty', 'emitted', 'confirmed', 'inFork', 'invalid'],
    defaultValue: 'empty'
  },
  blockId: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  }
});

const schema = new SimpleSchema([{
  state: {
    type: String,
    allowedValues: ['created', 'pending', 'confirmed', 'canceled'],
    defaultValue: 'created'
  },
  requestUserId: {
    type: String,
  },
  requestedAmount: {
    type: Number,
  },
  retailUserId: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue: function() { if (!this.isSet) return new Date(); else return undefined; },
  },
  lastUpdatedAt: {
    type: Date,
    autoValue: function() { return new Date(); },
  },
  transactionData: {
    type: transactionData,
    optional: true,
  },
}]);

Requests.attachSchema(schema);

export default Requests;
