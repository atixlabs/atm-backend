'use strict';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Request from '../../imports/collections/requests';


Meteor.methods({
  requestsByUser(userId) {
    check(userId, String);
    return Request.find({requestUserId: userId}).count();
  }
});

Meteor.publish('requests.all', function tasksPublication() {
  return Request.find();
});

