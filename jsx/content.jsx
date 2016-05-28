var Content = React.createClass({
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
    return <div className="row">
      {this.state.errors.length > 0 ? <h3>Errors</h3> : ""}
      {this.state.errors.map(function(err, i) {
      return <div className="col-md-12" key={i}>
        <p className="bg-danger">{err}</p>
      </div>; }.bind(this))}
    </div>;
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
    return <div className="container">
      {this.errors()}
      <Universes key={this.state.last_render} opts={opts} />
    </div>;
  }
});
