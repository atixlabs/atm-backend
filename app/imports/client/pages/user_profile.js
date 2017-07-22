import './user_profile.html';
import Users from '../../collections/users.js';
import TransferEvents from '../../collections/transfer_events.js';

TemplateController('userProfile', {
  onCreated() {
    this.autorun(() => {
      Meteor.subscribe('userById', this.data.id);
    });
  },

  helpers: {
    user() {
      return Users.findOne({
        _id: this.data.id
      });
    }
  }
});

TemplateController('userData', {
  props: new SimpleSchema({
    user: {
      type: Object,
      blackbox: true
    }
  }),
  onCreated() {
    this.autorun(() => {
      Meteor.subscribe('eventsByAddress', `0x${this.props.user.address}`);
    });
  },
  helpers: {
    userEvents() {
      return TransferEvents.findAllByAddress(`0x${this.props.user.address}`);
    },
    userEventsSettings() {
      return {
        rowsPerPage: 5,
        showFilter: false,
        showNavigation: 'auto',
        fields: [{
          key: 'from',
          label: 'From'
        }, {
          key: 'to',
          label: 'to'
        }, {
          key: 'value',
          label: 'Value'
        }],
        useFontAwesome: true,
        group: 'client'
      };
    }
  }
});
