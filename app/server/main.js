import { Meteor } from 'meteor/meteor';

import {watch_chain} from '../imports/server/blockchain_importer'

Meteor.startup(() => {
  watch_chain();
});
