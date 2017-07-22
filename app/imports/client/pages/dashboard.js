import Requests from '../../collections/requests';
import Users from '../../collections/users';
import moment from 'moment';

TemplateController('dashboard', {
  onCreated() {
    const self = this;
    this.autorun(() => {
      self.subscribe('requests.all');
      self.subscribe('users.all');
      console.log('requests', Requests);
    });
  },
  helpers: {
    getTotalUserCount() {
      return Users.find().count();
    },
    getTotalTransactionsCount() {
      return Requests.find().count();
    },
    getTotalTransacted() {
      let amount = 0;
      Requests.find({ state: "confirmed" }).map(function(doc) {
        amount += doc.requestedAmount;
      });
      return amount;
    },
    getTransactionsCompletePerc(){
      const total = Requests.find().count();
      const confirmed = Requests.find({ state: "confirmed" }).count();
      if(total == 0) return '-';
      return (confirmed / total) * 100;
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