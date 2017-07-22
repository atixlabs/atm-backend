'use strict';

TemplateController('mainLayout', {
  helpers: {
  },
  events: {
    'click #sidebar-option'(event) {
      FlowRouter.go('/' + event.target.dataset.url);
    },
    'click #logout'() {
      Meteor.logout();
      FlowRouter.go('/login');
    }
  },
});

