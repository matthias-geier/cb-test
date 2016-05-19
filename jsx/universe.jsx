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
  updateUniverse: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().match("^\/universe\/([^\/]+)");
    if (match) {
      if (match[1] !== state.universe) {
        state.universe = match[1];
        this.setState(state);
      }
    } else {
      if ("universe" in state) {
        delete(state.universe);
        this.setState(state);
      }
    }
  },
  clickHandler: function(e) {
    e.preventDefault();
    promise.post("/api/universe", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, payload.body.id,
          "/universe/" + payload.body.id);
        this.update();
        var state = this.state;
        state.universe = payload.body.id;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var universe = e.target.dataset.id;
    this.props.opts.reroute("/universe/" + universe, universe);
  },
  componentDidMount: function() {
    this.update();
    this.updateUniverse();
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverses: this.update
    };
    return <div>
      <h2>Universes</h2>
      <form className="form-inline">
        <button type="submit" className="btn btn-default"
          onClick={this.clickHandler}>New</button>
      </form>
      <ul>
      {this.state.universes.map(function(elem) {
        return <li key={elem.id}>
          <a href="#" onClick={this.hrefHandler} data-id={elem.id}>
            {elem.title || elem.id}
          </a>
        </li>;
      }.bind(this))}
      </ul>
      { this.state.universe ?
        <Universe opts={opts} id={this.state.universe} /> :
        "" }
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
      if (payload.status === 200) {
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.id,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateUniverses();
        this.setState(payload.body);
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
    if (this.state.length === 0) { return <div />; }

    var universe = this.state;
    return <div>
      <h3>{universe.title || universe.id}</h3>

      <form className="form-inline" onSubmit={this.updateHandler}>
        <input placeholder="Universe title" ref="title"
          defaultValue={universe.title} />
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
