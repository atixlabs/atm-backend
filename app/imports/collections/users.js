import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import _ from 'lodash';

const Users = Meteor.users;

const userPersonalInformation = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  password: {
    type: String,
    optional: true,
  },
  fullName: {
    type: String,
    optional: true,
  },
  facebookId: {
    type: String,
    optional: true,
  },
  birthdate: {
    type: Date,
    optional: true,
  },
  phone: {
    type: String,
    optional: true,
  },
  gender: {
    type: String,
    allowedValues: ['male', 'female'],
    optional: true
  },
  legalPersonalId: {
    type: Number,
    optional: true
  },
});

const userAppSettings = new SimpleSchema({
  notificationsPerDay: {
    type: Number,
    optional: true,
  },
});

const userAppData = new SimpleSchema({
  oneSignalId: {
    type: String,
    optional: true,
  },
  maxAllowedWithdrawal: {
    type: Number,
    optional: true,
  },
});

const userSchema = new SimpleSchema({
  address: {
    type: String,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  personalInformation: {
    type: userPersonalInformation,
    optional: true,
  },
  appSettings: {
    type: userAppSettings,
    optional: true,
  },
  appData: {
    type: userAppData,
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue: function() { if (!this.isSet) return new Date(); else return undefined; },
  },
});


Users.attachSchema(userSchema);

Users.findByAddress = function(address) {
  check(address, String);
  return Users.findOne({ 'address': address });
};

Users.findByFacebookId = function(facebookId) {
  check(facebookId, String);
  return Users.findOne({ 'personalInformation.facebookId': facebookId });
};


Users.findByEmailAndPassword = function(email, password) {
  check(email, String);
  check(password, String);

  return Users.findOne({
    'email': email,
    'personalInformation.password': password,
  });
};

Users.addOneSignalId = function(userId, oneSignalId) {
  check(userId, String);
  check(oneSignalId, String);

  Users.update({ _id: userId }, { $set: { 'appData.oneSignalId': oneSignalId } });
};

if(Meteor.isServer) {
  Meteor.publish('userById', function(userId) {
    check(userId, String);
    return Users.find({_id: userId});
  });
}


export default Users;
