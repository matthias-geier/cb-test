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
    var url = "/universe/" + universe;
    window.history.pushState({}, e.target.innerHTML, url);
    var state = this.state;
    state.universe = universe;
    this.setState(state);
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
      updateUniverses: this.update,
      updateUniverse: this.updateUniverse
    };
    return <div>
      <h2>Universes</h2>
      <form className="form-inline">
        <button type="submit" className="btn btn-default"
          onClick={this.clickHandler}>New</button>
      </form>
      <ul>
      {this.state.universes.map(function(elem) {
        return <li key={elem.id+elem.title}>
          <a href={"/universe/" + elem.id} onClick={this.hrefHandler}
            data-id={elem.id}>
            {elem.title || elem.id}
          </a>
        </li>;
      }.bind(this))}
      </ul>
      { this.state.universe ?
        <Universe opts={opts} id={this.state.universe}
          key={this.state.universe}/> :
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
        this.props.opts.updateUniverse();
        this.props.opts.updateUniverses();
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  charHrefHandler: function(e) {
    e.preventDefault();
    var char = e.target.innerHTML;
    var url = "/universe/" + this.props.id + "/character/" + char;
    window.history.pushState({}, char, url);
    var state = this.state;
    state.character = char;
    this.setState(state);
  },
  componentDidMount: function() {
    this.update();
  },
  render: function() {
    if (Object.keys(this.state).length === 0) { return <div />; }
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.update
    };

    var universe = this.state;
    return <div>
      <h3>{universe.title || universe.id}</h3>

      <form className="form-inline" onSubmit={this.updateHandler}>
        <input className="form-control" placeholder="Universe title" ref="title"
          defaultValue={universe.title} />
        <input type="submit" className="btn btn-default" value="Update" />
      </form>

      <div>
        {universe.characters.map(function(elem) {
          return <a href={"/universe/" + this.props.id + "/character/" + elem}
            onClick={this.charHrefHandler}>
            {elem}
          </a>;
        }.bind(this))}
      </div>
      { this.state.character ?
        <Character opts={opts} uid={this.props.id} id={this.state.character}
          key={this.state.character} /> :
        "" }
    </div>;
  }
});
