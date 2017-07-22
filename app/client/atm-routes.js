'use strict';

import '../imports/client/atm/code.html';
import '../imports/client/atm/menu.html';
import '../imports/client/atm/deposit.html';
import '../imports/client/atm/atm-layout.html';
import '../imports/client/atm/atm-layout.js';

FlowRouter.route('/atm', {
  name: 'atm',
  action: function() {
    BlazeLayout.render('atm', { content: 'menu'});
  }
});

FlowRouter.route('/deposit', {
  name: 'reverse-atm',
  action: function() {
    BlazeLayout.render('atm', { content: 'deposit'});
  }
});

FlowRouter.route('/code', {
  name: 'code',
  action: function() {
    BlazeLayout.render('atm', { content: 'code'});
  }
});

