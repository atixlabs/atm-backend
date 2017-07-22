import moment from 'moment';

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
  state: {
    tokens: "?",
    userRequests: "?"
  },
  onCreated() {
    this.autorun(() => {
      Meteor.subscribe('requests.all');
      Meteor.subscribe('eventsByAddress', `0x${this.props.user.address}`);
      Meteor.call('balance', this.props.user._id, (err, res) => {
        if (err) console.log(err);
        else this.state.tokens = res;
      });
      Meteor.call('requestsByUser', this.props.user._id, (err, res) => {
        if (err) console.log(err);
        else this.state.userRequests = res;
      });
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
    },
    userRequests() {
      return Requests.find({
        requestUserId: this.props.user._id
      });
    },

    requestsSettings() {
      return {
        rowsPerPage: 20,
        fields: [{
            key: 'createdAt',
            label: 'Created At',
            fn: (it) => {
              return moment(it).format('MM-DD-YYYY HH:mm');
            }
          },
          {
            key: 'requestedAmount',
            label: 'Amount'
          },
          {
            key: 'state',
            label: 'State'
          }
        ]
      }
    },
    address() {
      return `0x${this.props.user.address}`;
    },
    birthdate() {
      return moment(this.props.user.personalInformation.birthdate).format("LL");
    },
  }
});