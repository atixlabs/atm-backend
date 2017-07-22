import Requests from '../../collections/requests';
import moment from 'moment';

TemplateController('dashboard', {
  onCreated() {
    const self = this;
    this.autorun(() => {
      self.subscribe('requests.all');
      console.log('requests', Requests);
    });
  },
  helpers: {
    getTotalTransactionsCount() {
      return Requests.find().count();
    },
    isLoading() {
      return this.subsReady();
    },
    requests() {
      return Requests.find()
    },
    requestsSettings() {
      return {
        rowsPerPage: 20,
        showFilter: true,
        fields: [
          { key: 'createdAt', label: 'Created At', fn: (it) => { return moment(it).format('MM-DD-YYYY HH:mm');}},
          { key: 'requestedAmount', label: 'Amount'},
          { key: 'state', label: 'State'}
        ]
      }
    }
  }
});