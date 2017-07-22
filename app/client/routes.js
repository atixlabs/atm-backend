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

FlowRouter.route('/', {
  name: 'main',
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'dashboard'});
  }
});
