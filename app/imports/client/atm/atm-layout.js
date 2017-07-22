'use strict';

TemplateController('atm', {
    helpers: {
    },
    events: {
        'click #reverse-atm'(event) {
            FlowRouter.go('/deposit');
        },
        'click #confirm-deposit'(event) {
            FlowRouter.go('/code');
        },
        'click #go-to-menu'(event) {
            FlowRouter.go('/atm');
        },
    }
});

