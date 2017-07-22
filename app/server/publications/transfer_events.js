'use strict';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';


Meteor.methods({
});

Meteor.publish('transferEvents.all', function tasksPublication() {
  return TransferEvents.find();
});

