var Universes = React.createClass({
  getInitialState: function() {
    return { universes: [] };
  },
  closeUniverseIf: function(uid) {
    if (uid && this.state.uid !== uid) {
      return;
    }
    window.history.pushState({}, "/", "/");
    this.updateUniverse();
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
      if (match[1] !== state.uid) {
        state.uid = match[1];
        this.setState(state);
      }
    } else {
      if ("uid" in state) {
        delete(state.uid);
        this.setState(state);
      }
    }
  },
  createHandler: function(e) {
    e.preventDefault();
    promise.post("/api/universe", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, payload.body.uid,
          "/universe/" + payload.body.uid);
        this.update();
        var state = this.state;
        state.uid = payload.body.uid;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var uid = e.target.dataset.uid;
    var url = "/universe/" + uid;
    window.history.pushState({}, e.target.innerHTML, url);
    var state = this.state;
    state.uid = uid;
    this.setState(state);
  },
  hrefResetHandler: function(e) {
    e.preventDefault();
    window.history.pushState({}, "/", "/");
    var state = this.state;
    delete(state.uid);
    this.setState(state);
  },
  destroyHandler: function(e) {
    e.preventDefault();
    var uid = e.currentTarget.dataset.uid;
    var url = "/universe/" + uid;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closeUniverseIf(uid);
        this.update();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
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
    return <div className="row">
      <Session opts={opts}>
        <h1 style={{display: "inline-block"}}>
          <a href="#" onClick={this.hrefResetHandler}>
            <span style={{textTransform: "uppercase"}}>rpuniverse</span>
            <span style={{fontVariant: "small-caps"}}>.org</span>
          </a>
        </h1>
        <form className="form-inline" style={{display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}>
          <button type="submit" className="btn btn-default"
            onClick={this.createHandler}>
            <span className="glyphicon glyphicon-plus" aria-hidden="true" />
          </button>
        </form>
      </Session>
      <ul className="col-xs-11 col-xs-offset-1 col-md-11 col-md-offset-1">
      {this.state.universes.map(function(elem) {
        return <li key={elem.uid+elem.title}>
          <a href={"/universe/" + elem.uid} onClick={this.hrefHandler}
            data-uid={elem.uid}>
            {elem.title || elem.uid}
          </a>
          <a href="#" style={{marginLeft: "2em"}} onClick={this.destroyHandler}
            data-uid={elem.uid}>
            <span className="glyphicon glyphicon-trash" aria-hidden="true" />
          </a>
        </li>;
      }.bind(this))}
      </ul>
      { this.state.uid ?
        <Universe opts={opts} uid={this.state.uid}
          key={this.state.uid} /> :
        <Landing /> }
    </div>;
  }
});

var Universe = React.createClass({
  getInitialState: function() {
    return {};
  },
  toggleEditHandler: function(e) {
    e.preventDefault();
    this.toggleEdit();
  },
  toggleEdit: function() {
    var state = this.state;
    if (state.editable) {
      delete(state.editable);
    } else {
      state.editable = true;
    }
    this.setState(state);
  },
  currentRoute: function() {
    var match = this.props.opts.reqUrl().match("^/universe/[^/]+/?([^/]+)");
    return match ? match[1] : "";
  },
  update: function() {
    promise.get("/api/universe/" + this.props.uid).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.universe = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.uid,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateUniverse();
        this.props.opts.updateUniverses();
        this.toggleEdit();
        var state = this.state;
        state.universe = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  fileSelectedHandler: function(e) {
    e.preventDefault();
    var reader = new FileReader();
    var file = this.refs.uploadbox.files[0];
    reader.onloadend = function(e) {
      promise.post("/api/universe/" + this.props.uid + "/restore",
        JSON.stringify({data: JSON.parse(e.target.result)}),
        { "Content-Type": "application/json" }).then(function(err, text, xhr) {

        var payload = JSON.parse(text);
        window.location.assign("/universe/" + this.props.uid);
      }.bind(this));
    }.bind(this);
    reader.readAsText(file);
  },
  selectFileHandler: function(e) {
    e.preventDefault();
    this.refs.uploadbox.click();
  },
  backupHandler: function(e) {
    e.preventDefault();
    window.location.assign("/api/universe/" + this.props.uid + "/backup");
  },
  handleHref: function(title, url_partial) {
    return function(e) {
      e.preventDefault();
      window.history.pushState({}, title,
        "/universe/" + this.props.uid + "/" + url_partial);
      this.forceUpdate();
    }.bind(this);
  },
  componentDidMount: function() {
    this.update();
  },
  renderEdit: function() {
    return <form className="form-inline" onSubmit={this.updateHandler}>
      <input className="form-control" placeholder="Universe title" ref="title"
        defaultValue={this.state.universe.title} />
      <input type="submit" className="btn btn-default" value="Update" />
    </form>;
  },
  renderMenu: function() {
    var current = this.currentRoute();
    var menu_items = [["prop", "Props"], ["story", "Stories"]];
    return <ul className="nav nav-tabs" key={current}
      style={{marginTop: "2em"}}>
      {menu_items.map(function(elem) {
        return <li key={elem[0]} role="presentation" className={
          current === elem[0] ? "active" : ""}>
          <a href="#" onClick={this.handleHref(elem[1], elem[0])}>{elem[1]}</a>
        </li>;
      }.bind(this))}
    </ul>;
  },
  render: function() {
    if (!this.state.universe) { return <div />; }
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.update
    };

    var universe = this.state.universe;
    var title = universe.title || universe.uid;
    var current = this.currentRoute();
    return <div className="col-xs-12 col-md-12" style={{backgroundColor: "#e5e5e5", minHeight: "50%", borderRadius: "5px"}}>
      <AccessKey uid={universe.uid} opts={opts}>
        <h2 style={{display: "inline-block"}}>
          <a href="#" onClick={this.handleHref(title, "")}>{title}</a>
        </h2>
        <div style={{display: "inline-block", marginLeft: "0.6em"}}>
          <a href="#" onClick={this.backupHandler}>
            <span style={{fontSize: "1.8em"}}
              className="glyphicon glyphicon-download" aria-hidden="true" />
          </a>
        </div>
        <div style={{display: "inline-block", marginLeft: "0.6em"}}>
          <a href="#" onClick={this.selectFileHandler}>
            <span style={{fontSize: "1.8em"}}
              className="glyphicon glyphicon-upload" aria-hidden="true" />
          </a>
          <input type="file" className="hidden" ref="uploadbox"
            onChange={this.fileSelectedHandler} />
        </div>

        <form className="form-inline" style={{display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}>
          <button type="submit" className="btn btn-default"
            onClick={this.toggleEditHandler}>
            <span className="glyphicon glyphicon-pencil" aria-hidden="true" />
          </button>
        </form>
      </AccessKey>
      {this.state.editable ? this.renderEdit() : <div />}

      {this.renderMenu()}

      {current === "prop" ?
        <Props uid={this.props.uid} props={universe.props}
          opts={opts} key={"c" + universe.props.
          map(function(elem) { return elem.updated_at; } ).join("")} /> :
        ""}

      {current === "story" ?
        <Stories uid={this.props.uid} stories={universe.stories}
          opts={opts} key={"s" + universe.stories.
          map(function(elem) { return elem.updated_at; } ).join("")} /> :
        ""}
    </div>;
  }
});
