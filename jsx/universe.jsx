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
    console.log(e.target);
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
        return <li key={elem.id}>
          <a href="#" onClick={this.hrefHandler}>{elem.title || elem.id}</a>
        </li>;
      }.bind(this))}
      </ul>
    </div>;
  }
});

var Universe = React.createClass({
  getInitialState: function() {
    return {};
  },
  update: function() {
    promise.get("/api/universe/" + this.props.id).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      var state = this.state;
      if (payload.status === 200) {
        state.universe = payload.body;
      } else {
        state = {};
        this.props.opts.addError(payload.body);
      }
      this.setState(state);
    }.bind(this));
  },
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.id,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
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
    if (!this.state.universe) { return <div />; }

    var universe = this.state.universe;
    return <div>
      <h3>{universe.name || universe.id}</h3>

      <form className="form-inline" onSubmit={this.updateHandler}>
        <input placeholder="Universe title" ref="title" />
        <input type="submit" className="btn btn-default" value="Update" />
      </form>

      <div>
        {universe.characters.map(function(elem) {
          return <a href="#">{elem}</a>;
        }.bind(this))}
      </div>
    </div>;
  }
});
