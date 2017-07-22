'use strict';

import '../imports/client/footer.html';
import '../imports/client/footer.js';
import '../imports/client/main-layout.html';
import '../imports/client/main-layout.js';
import '../imports/client/main-header.html';
import '../imports/client/main-header.js';
import '../imports/client/sample-page.html';
import '../imports/client/sample-page.js';
import '../imports/client/sidebar.html';
import '../imports/client/sidebar.js';

FlowRouter.route('/', {
  name: 'main',
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'samplePage'});
  }
});
