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
  can: function(cap) {
    var roles = ["read", "write", "manage"];
    var matching_roles = [];
    for (i in roles) {
      matching_roles.push(roles[i]);
      if (roles[i] === this.state.universe.capability) { break; }
    };
    return matching_roles.indexOf(cap) >= 0;
  },
  update: function() {
    promise.get("/api/universe/" + this.props.uid).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 200) {
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
      if (xhr.status === 200) {
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
        if (payload.status === 200) {
          window.location.assign("/universe/" + this.props.uid);
        } else {
          this.props.opts.addError(payload.body || payload.error);
        }
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
  render: function() {
    if (!this.state.universe) { return <div />; }
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.update,
      can: this.can
    };

    var universe = this.state.universe;
    var title = universe.title || universe.uid;
    return <div className="row" style={{backgroundColor: "#e5e5e5",
      minHeight: "50%", borderRadius: "5px"}}>
      <AccessKeys uid={universe.uid} opts={opts}
        access_keys={this.state.universe.access_keys}>
        <h2 style={{display: "inline-block"}}>
          <a href="#" onClick={this.handleHref(title, "")}>{title}</a>
        </h2>
        {this.can("manage") ?
          <div style={{display: "inline-block", marginLeft: "2em"}}>
            <a href="#" onClick={this.backupHandler} title="Download">
              <span style={{fontSize: "1.8em"}}
                className="glyphicon glyphicon-download" aria-hidden="true" />
            </a>
          </div> :
          ""}
        {this.can("manage") ?
          <div style={{display: "inline-block", marginLeft: "0.6em"}}>
            <a href="#" onClick={this.selectFileHandler} title="Upload">
              <span style={{fontSize: "1.8em"}}
                className="glyphicon glyphicon-upload" aria-hidden="true" />
            </a>
            <input type="file" className="hidden" ref="uploadbox"
              onChange={this.fileSelectedHandler} />
          </div> :
          ""}
        {this.can("write") ?
          <form className="form-inline" style={{display: "inline-block",
            verticalAlign: "middle", marginLeft: "2em"}}>
            <button type="submit" className="btn btn-default"
              onClick={this.toggleEditHandler} title="Edit">
              <span className="glyphicon glyphicon-edit" aria-hidden="true" />
            </button>
          </form> :
          ""}
      </AccessKeys>
      {this.state.editable ? this.renderEdit() : <div />}

      <UniverseMenu opts={opts} callback={this.handleHref}>
        <PropList uid={this.props.uid} props={universe.props}
          opts={opts} key={"c" + universe.props.
          map(function(elem) { return elem.updated_at; } ).join("")} />
        <StoryList uid={this.props.uid} stories={universe.stories}
          opts={opts} key={"s" + universe.stories.
          map(function(elem) { return elem.updated_at; } ).join("")} />
      </UniverseMenu>
    </div>;
  }
});
