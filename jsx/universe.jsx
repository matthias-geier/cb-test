var Universes = React.createClass({
  getInitialState: function() {
    return { universes: [] };
  },
  update: function() {
    promise.get("/api/universe").then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.universes = payload.body;
        this.setState(state);
      }
    }.bind(this));
  },
  clickHandler: function(e) {
    promise.post("/api/universe", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.update();
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
    e.preventDefault();
  },
  hrefHandler: function(e) {
    var universe = e.target.innerHTML;
    this.props.opts.reroute("/universe/" + universe, universe);
    e.preventDefault();
  },
  componentDidMount: function() {
    this.update();
  },
  render: function() {
    return <div>
      <h2>Universes</h2>
      <form className="form-inline">
        <button type="submit" className="btn btn-default"
          onClick={this.clickHandler}>New</button>
      </form>
      <ul>
      {this.state.universes.map(function(elem) {
        return <li key={elem}>
          <a href="#" onClick={this.hrefHandler}>{elem}</a>
        </li>;
      }.bind(this))}
      </ul>
    </div>;
  }
});

var Universe = React.createClass({
  render: function() {
    return <div>gna</div>;
  }
});
