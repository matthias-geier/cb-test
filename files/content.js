var Content = React.createClass({displayName: "Content",
  getInitialState: function() {
    return { channels: [], errors: [] };
  },
  withState: function(key, func) {
    var state = this.state;
    state[key] = func(state[key]);
    this.setState(state);
  },
  delayWithState: function(key, func) {
    return function() {
      this.withState(key, func);
    }.bind(this);
  },
  updateChannels: function() {
    promise.get("/api/talk").then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.withState("channels", function() { return payload.body; });
      }
    }.bind(this));
  },
  addError: function(err) {
    this.withState("errors", function(list) {
      list.push(err);
      return list;
    });

    var p = new promise.Promise();
    setTimeout(function(){ p.done(); }, 5000);
    p.then(this.delayWithState("errors", function(list) {
      return list.slice(1);
    }));
  },
  componentDidMount: function() {
    this.updateChannels();
  },
  errors: function() {
    return this.state.errors.map(function(err, i) {
      return React.createElement("p", {key: i, className: "bg-danger"}, err);
    }.bind(this));
  },
  channels: function(opts) {
    if (this.state.channels.length === 0) {
      return "No channels found";
    }
    return React.createElement("ul", null, 
      this.state.channels.map(function(elem) {
        return React.createElement(ChannelItem, {key: elem, name: elem, opts: opts});
      }.bind(this))
    );
  },
  render: function() {
    var opts = {
      withState: this.withState,
      addError: this.addError,
      updateChannels: this.updateChannels
    };
    return React.createElement("div", {className: "container"}, 
      React.createElement("h2", null, "Channels"), 
      this.errors(), 
      React.createElement(AddChannel, {opts: opts}), 
      this.channels(opts)
    );
  }
});
