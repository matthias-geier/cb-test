var Content = React.createClass({displayName: "Content",
  getInitialState: function() {
    return { errors: [], last_render: Math.floor(Date.now() / 1000) };
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
  errors: function() {
    if (this.state.errors.length === 0) { return ""; }
    return React.createElement("div", {className: "row"}, 
      React.createElement("h3", null, "Errors"), 
      this.state.errors.map(function(err, i) {
      return React.createElement("div", {className: "col-xs-12 col-md-12", key: i}, 
        React.createElement("p", {className: "bg-danger"}, err)
      ); }.bind(this))
    );
  },
  componentDidMount: function() {
    window.onpopstate = function(e) {
      this.withState("last_render", function() {
        return Math.floor(Date.now() / 1000);
      });
    }.bind(this)
  },
  render: function() {
    var opts = {
      withState: this.withState,
      addError: this.addError,
      reqUrl: this.reqUrl
    };
    return React.createElement("div", {className: "container"}, 
      this.errors(), 
      React.createElement(Universes, {key: this.state.last_render, opts: opts})
    );
  }
});
