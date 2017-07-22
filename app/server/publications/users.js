'use strict';

import { Meteor } from 'meteor/meteor';
import Users from '../../imports/collections/users';

Meteor.methods({
});

Meteor.publish('userById', function(userId) {
    check(userId, String);
    return Users.find({_id: userId});
});

Meteor.publish('users.all', function tasksPublication() {
    return Users.find();
});

