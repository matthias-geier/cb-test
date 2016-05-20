var Character = React.createClass({
  getInitialState: function() {
    return {};
  },
  charUrl: function() {
    return "/universe/" + this.props.uid + "/character/" + this.props.id;
  },
  update: function() {
    promise.get("/api" + this.charUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  componentDidMount: function() {
    this.update();
  },
  render: function() {
    if (Object.keys(this.state).length === 0) { return <div />; }

    var char = this.state;
    return <div>{char.id}</div>;
  }
});

