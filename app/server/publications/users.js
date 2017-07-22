'use strict';

import { Meteor } from 'meteor/meteor';
import Users from '../../imports/collections/users';
import { get_balance } from '../../imports/server/blockchain_tools';

Meteor.methods({
  balance(userId) {
    check(userId, String);
    const address = Users.findOne(userId).address;
    return get_balance(address).toString();
  }
});

Meteor.publish('userById', function(userId) {
    check(userId, String);
    return Users.find({_id: userId});
});

Meteor.publish('users.all', function tasksPublication() {
    return Users.find();
});

