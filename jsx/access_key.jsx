var AccessKeys = React.createClass({
  getInitialState: function() {
    return {};
  },
  toggleEditHandler: function(e) {
    e.preventDefault();
    promise.get("/api/universe/" + this.props.uid).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.access_keys = payload.body.access_keys;
        this.setState(state);
        this.toggleEdit();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  toggleEdit: function() {
    var state = this.state;
    if (state.editable) {
      delete(state.editable);
      delete(state.access_keys);
    } else {
      state.editable = true;
    }
    this.setState(state);
  },
  destroyCallback: function(key) {
    promise.del("/api/universe/" + this.props.uid + "/access_key/" + key, null,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      if (xhr.status === 204) {
        var state = this.state;
        state.access_keys = state.access_keys.reduce(function(acc, access_key) {
          if (key !== access_key["id"]) { acc.push(access_key); }
          return acc;
        }, []);
        this.setState(state);
      } else {
        var payload = JSON.parse(text);
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  createHandler: function(e) {
    e.preventDefault();
    promise.post("/api/universe/" + this.props.uid + "/access_key", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 201) {
        var state = this.state;
        state.access_keys = payload.body.access_keys;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  renderEdit: function() {
    return <div>
      <h4 style={{display: "inline-block"}}>Access Keys</h4>
      <form className="form-inline" style={
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}>
        <button type="submit" className="btn btn-default"
          onClick={this.createHandler} title="Create new access key">
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
        </button>
      </form>
      {this.state.access_keys.map(function(elem) {
        return <AccessKey key={elem["id"]} access_key={elem}
          destroyCallback={this.destroyCallback} opts={this.props.opts} />;
      }.bind(this))}
    </div>;
  },
  render: function() {
    return <div className="col-xs-12 col-md-12">
      {this.props.opts.can("manage") ?
        <div style={{display: "inline-block"}}>
          <a href="#" onClick={this.toggleEditHandler} title="Access keys">
            <span style={{fontSize: "1.4em"}}
              className="glyphicon glyphicon-lock" aria-hidden="true" />
          </a>
        </div> :
        <div style={{display: "inline-block"}} />
      } <div style={{display: "inline-block", marginLeft: "0.5em"}}>
        {this.props.children}
      </div>

      {this.state.editable ? this.renderEdit() : <div />}
    </div>;
  }
});

var AccessKey = React.createClass({
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
  updateHandler: function(e) {
    e.preventDefault();
    var data = {};
    if (this.refs.title.value !== "") { data["title"] = this.refs.title.value; }
    if (e.currentTarget.dataset.cap) {
      data["cap"] = e.currentTarget.dataset.cap;
    }
    promise.put("/api/universe/" + this.state.access_key.uid + "/access_key/" +
      this.state.access_key.id, JSON.stringify(data),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.access_key = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    this.toggleDestroy(e.currentTarget.dataset.accessKey);
  },
  toggleDestroy: function(key) {
    var state = this.state;
    if (state.destroy && !key) {
      delete(state.destroy);
    } else {
      state.destroy = true;
    }
    this.setState(state);
  },
  componentDidMount: function() {
    var state = this.state;
    state.access_key = this.props.access_key;
    this.setState(state);
  },
  renderCap: function(access_key, current_cap) {
    return <span>
      {["read", "write", "manage"].map(function(cap) {
        var map = {read: "eye-open", write: "pencil", manage: "tower"};
        return <button type="submit" className="btn btn-default"
          onClick={this.updateHandler} title={cap} data-cap={cap}
          data-access-key={access_key} style={{marginLeft: "0.5em"}} key={cap}>
          <span className={"glyphicon glyphicon-" + map[cap]} aria-hidden="true"
            style={{color: current_cap == cap ? "#337ab7" : null}} />
        </button>
      }.bind(this))}
    </span>;
  },
  renderEdit: function() {
    var id = this.state.access_key.id;
    var cap = this.state.access_key.cap;
    var title = this.state.access_key.title;
    var trash =
      <button type="submit" className="btn btn-default"
        onClick={this.destroyHandler} data-access-key={id}
        style={{marginLeft: "0.5em"}} title="Delete">
        <span className="glyphicon glyphicon-trash" aria-hidden="true" />
      </button>;
    return <span style={{paddingLeft: "1em"}}>
      <form className="form-inline" onSubmit={this.updateHandler}
        style={{display: "inline-block"}}>
        <input className="form-control" placeholder="Access key title"
          ref="title" defaultValue={title} />
        <input type="submit" className="btn btn-default" value="Update" />
      </form>
      {this.renderCap(id, cap)}
      {this.state.destroy ?
        <ConfirmBox payload={id} callback={this.props.destroyCallback}
          close={this.toggleDestroy}>{trash}</ConfirmBox> : trash
      }
    </span>;
  },
  render: function() {
    if (!this.state.access_key) { return <div />; }
    return <div className="row">
      <div className="col-sm-3" style={{marginTop: "4px"}}>
        <a href={"/key/" + this.state.access_key.id}>
          {this.state.access_key.id}
        </a> ({this.state.access_key.title || "no title"})
      </div>
      <div className="col-sm-1">
        <form className="form-inline" style={{display: "inline-block",
          marginLeft: "2em"}}>
          <button type="submit" className="btn btn-default"
            onClick={this.toggleEditHandler} title="Edit">
            <span className="glyphicon glyphicon-edit" aria-hidden="true" />
          </button>
        </form>
      </div>
      <div className="col-sm-5">
        {this.state.editable ? this.renderEdit() : <span />}
      </div>
    </div>;
  }
});
