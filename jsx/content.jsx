var Content = React.createClass({
  getInitialState: function() {
    return { errors: [] };
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
  reqUrl: function() {
    return window.location.href.toString().split(window.location.host)[1].
      split("#")[0];
  },
  reroute: function(url, title) {
    window.history.pushState({}, title, url);
    this.forceUpdate();
  },

  getUniverse: function() {
    var match = this.reqUrl().match("^\/universe\/([^\/]+)");
    return match ? match[1] : undefined;
  },

  errors: function() {
    return this.state.errors.map(function(err, i) {
      return <p key={i} className="bg-danger">{err}</p>;
    }.bind(this));
  },
  render: function() {
    var opts = {
      withState: this.withState,
      addError: this.addError,
      reqUrl: this.reqUrl,
      reroute: this.reroute
    };
    var universe = this.getUniverse();
    return <div className="container">
      <Universes opts={opts} />
      {this.errors()}
      {
        universe ?
          <Universe id={universe} opts={opts} /> :
          <div />
      }
    </div>;
  }
});
