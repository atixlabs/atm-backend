'use strict';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Request from '../../imports/collections/requests';


Meteor.methods({
});

Meteor.publish('requests.all', function tasksPublication() {
  return Request.find();
});

