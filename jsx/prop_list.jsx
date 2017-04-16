var PropList = React.createClass({
  getInitialState: function() {
    return {};
  },
  updateProp: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().
      match("^\/universe\/[^\/]+\/prop\/([^\/]+)");
    if (match) {
      if (match[1] !== state.pid) {
        state.pid = match[1];
        this.setState(state);
      }
    } else {
      if ("pid" in state) {
        delete(state.pid);
        this.setState(state);
      }
    }
  },
  toggleNewHandler: function(e) {
    e.preventDefault();
    this.toggleNew();
  },
  toggleNew: function() {
    var state = this.state;
    if (state.create_new) {
      delete(state.create_new);
    } else {
      state.create_new = true;
    }
    this.setState(state);
  },
  closePropIf: function(pid) {
    if (pid && this.state.pid !== pid) {
      return;
    }
    window.history.pushState({}, this.props.uid,
      "/universe/" + this.props.uid);
    this.updateProp();
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var pid = e.target.dataset.pid;
    var url = "/universe/" + this.props.uid + "/prop";
    var state = this.state;
    if (pid) {
      url += "/" + pid;
      state.pid = pid;
    } else {
      delete(state.pid);
    }
    window.history.pushState({}, pid, url);
    this.setState(state);
  },
  createNewHandler: function(e) {
    e.preventDefault();
    var pid = this.refs.pid.value;
    var url = "/universe/" + this.props.uid + "/prop";
    promise.post("/api" + url,
      JSON.stringify({pid: pid}),
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 201) {
        window.history.pushState({}, pid, url + "/" + pid);
        var state = this.state;
        state.props.push(pid);
        state.props.sort();
        state.pid = pid;
        this.setState(state);
        this.toggleNew();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    this.toggleDestroy(e.currentTarget.dataset.pid);
  },
  toggleDestroy: function(pid) {
    var state = this.state;
    if (state.destroy && !pid) {
      delete(state.destroy);
    } else {
      state.destroy = pid;
    }
    this.setState(state);
  },
  destroyCallback: function(pid) {
    var url = "/universe/" + this.props.uid + "/prop/" + pid;
    promise.del("/api" + url,
      undefined,
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      if (xhr.status === 204) {
        this.closePropIf(pid);
        var state = this.state;
        state.props.splice(state.props.indexOf(pid), 1);
        this.setState(state);
      } else {
        var payload = JSON.parse(text);
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentWillMount: function() {
    var state = this.state;
    state.props = this.props.props;
    this.setState(state);
  },
  componentDidMount: function() {
    this.updateProp();
  },
  renderPropList: function(propTag) {
    return this.state.props.map(function(elem, i) {
      var trash = this.props.opts.can("write") ?
        <a href="#" style={{marginLeft: "2em"}} onClick={this.destroyHandler}
          data-pid={elem} title="Delete">
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a> :
        "";
      return <li key={elem+i}>
        <a href="#" data-pid={elem}
          onClick={this.hrefHandler}>{elem}</a>
        {this.state.destroy === elem ?
          <ConfirmBox payload={elem} callback={this.destroyCallback}
          close={this.toggleDestroy}>{trash}</ConfirmBox> : trash}
        {propTag && elem == this.state.pid ? propTag : ""}
      </li>;
    }.bind(this));
  },
  renderNew: function() {
    return <form className="form-inline" onSubmit={this.createNewHandler}>
      <input className="form-control" ref="pid" maxlength="24"
        placeholder="id (only a-z and _)" />
      <input type="submit" className="btn btn-default" value="Create" />
    </form>;
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateProp: this.updateProp,
      can: this.props.opts.can
    };
    var propTag = this.state.pid ?
      <Prop opts={opts} uid={this.props.uid} pid={this.state.pid}
        key={this.state.pid} /> :
      undefined;
    return <div style={{border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}} className="row">
      <div className="col-xs-12" style={{paddingLeft: "2em",
        paddingRight: "2em"}}>
        <h3 style={{display: "inline-block"}}>
          <a href="#" onClick={this.hrefHandler}>Props</a>
        </h3>
        {this.props.opts.can("write") ?
          <form className="form-inline" style={{display: "inline-block",
            verticalAlign: "middle", marginLeft: "2em"}}>
            <button type="submit" className="btn btn-default"
              onClick={this.toggleNewHandler} title="Create new prop">
              <span className="glyphicon glyphicon-plus" aria-hidden="true" />
            </button>
          </form> :
          ""}
        {this.state.create_new ? this.renderNew() : <div />}

        <ul className="list-unstyled">{this.renderPropList(propTag)}</ul>
      </div>
    </div>;
  }
});

