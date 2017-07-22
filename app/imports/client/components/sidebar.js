TemplateController('sidebar', {});

TemplateController('menuItem', {
  props: new SimpleSchema({
    text: {
      type: String
    },
    href: {
      type: String,
      defaultValue: "#",
    },
    routeName: {
      type: String
    }
  }),
  helpers: {
    activeClass() {
      // make this re-render on change, even if we don't use var
      FlowRouter.getRouteName();
      return (FlowRouter.current().route.name === this.props.routeName) ? 'active' : ' ';
    }
  }
});