'use strict';

import '../imports/client/components/footer.html';
import '../imports/client/components/footer.js';
import '../imports/client/components/main-header.html';
import '../imports/client/components/main-header.js';
import '../imports/client/components/sidebar.html';
import '../imports/client/components/sidebar.js';

import '../imports/client/layout/main-layout.html';
import '../imports/client/layout/main-layout.js';

import '../imports/client/pages/dashboard.html';
import '../imports/client/pages/dashboard.js';
import '../imports/client/pages/user_profile.js';
import '../imports/collections/users.js';

import '../imports/client/pages/user_list.html';
import '../imports/client/pages/user_list.js';

FlowRouter.route('/', {
  name: 'dashboard',
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'dashboard'});
  }
});


FlowRouter.route('/users', {
  name: 'userList',
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'userList'});
  }
});

FlowRouter.route('/user/:id', {
  name: 'userProfile',
  action: function(params) {
    BlazeLayout.render('mainLayout', {content: 'userProfile', data: {id: params.id}});
  }
});
