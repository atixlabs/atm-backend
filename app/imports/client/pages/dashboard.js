import TransferEvents from '../../collections/transfer_events';

TemplateController('dashboard', {
  onCreated() {
    const self = this;
    this.autorun(() => {
      self.subscribe('transferEvents.all');
      console.log('TransferEvents', TransferEvents);
    });
  },
  helpers: {
    getTotalTransactionsCount() {
      return TransferEvents.find().count();
    },
    isLoading() {
      return this.subsReady();
    },
    transferEvents() {
      return TransferEvents.find()
    }
  }
});