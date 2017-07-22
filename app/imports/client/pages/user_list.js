import Users from '../../collections/users';
import moment from 'moment';

TemplateController('userList', {
  onCreated() {
    const self = this;
    this.autorun(() => {
      self.subscribe('users.all');
    });
  },
  helpers: {
    isLoading() {
      return this.subsReady();
    },
    usersSettings() {
      return {
        collection: Users.find(),
        rowsPerPage: 20,
        showFilter: true,
        fields: [
          { key: 'createdAt', label: 'Created At', fn: (it) => { return moment(it).format('MM-DD-YYYY HH:mm');}},
          { key: 'personalInformation.fullName', label: 'Name'},
          { key: 'email', label: 'Email'},
          { key: 'address', label: 'Address'},
          { key: '_id', label: '', fn: (value) => {
            console.log(value);
            const href = FlowRouter.path("/user/" + value);
            return new Spacebars.SafeString("<a href=" + href + ">View</a>");
          }}
        ]
      }
    }
  }
});