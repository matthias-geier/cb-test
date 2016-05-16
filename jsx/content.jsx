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
  dispatch: function(routes, split) {
    var next = (split.length === 0) ? "_" : split[0];
    var rest = split.slice(1);
    if (!routes[next] && !routes["*"]) { return null; }
    else {
      var subroute = routes[next];
      if (!subroute && !routes["*"]) { return null; }
      else if (!subroute) { subroute = routes["*"]; }

      if (subroute["_"]) {
        return this.dispatch(subroute, rest);
      } else { return subroute; }
    }
  },
  route: function(opts) {
    var split = this.reqUrl().split("/").slice(1);
    var routes = {
      "_": <Universes opts={opts} />,
      universe: {
        "_": <Universes opts={opts} />,
        "*": {
          "_": <Universe opts={opts} />,
          story: <Stories opts={opts} />
        }
      }
    };
    return this.dispatch(routes, split) || routes["universe"]["_"];
  },
  reroute: function(url, title) {
    window.history.pushState({}, title, url);
    this.forceUpdate();
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
      reroute: this.reroute
    };
    return <div className="container">
      {this.errors()}
      {this.route(opts)}
    </div>;
  }
});
