var UniverseList = React.createClass({
  getInitialState: function() {
    return { universes: [] };
  },
  closeUniverseIf: function(uid) {
    if (uid && this.props.uid !== uid) {
      return;
    }
    window.history.pushState({}, "/", "/");
    this.props.updateUniverse();
  },
  updateAccessible: function() {
    promise.get("/api/universe").then(function(err, text, xhr) {
      if (xhr.status === 200) {
        var state = this.state;
        state.universes = JSON.parse(text).body;
        this.setState(state);
      }
    }.bind(this));
  },
  createHandler: function(e) {
    e.preventDefault();
    promise.post(
      "/api/universe",
      undefined,
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 201) {
        window.history.pushState({}, payload.body.uid,
          "/universe/" + payload.body.uid);
        this.props.opts.updateUniverse();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    this.toggleDestroy(e.currentTarget.dataset.uid);
  },
  toggleDestroy: function(uid) {
    var state = this.state;
    if (state.destroy && !uid) {
      delete(state.destroy);
    } else {
      state.destroy = uid;
    }
    this.setState(state);
  },
  destroyCallback: function(uid) {
    promise.del(
      "/api" + "/universe/" + uid,
      undefined,
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      if (xhr.status === 204) {
        this.closeUniverseIf(uid);
        this.props.opts.updateUniverse();
      } else {
        var payload = JSON.parse(text);
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentDidMount: function() {
    this.updateAccessible();
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverses: this.update,
      updateUniverse: this.props.opts.updateUniverse
    };
    return <div className="col-xs-12">
      <Session opts={opts}>
        {this.props.children[0]}
        <form className="form-inline" style={{display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}>
          <button type="submit" className="btn btn-default"
            onClick={this.createHandler}>
            <span className="glyphicon glyphicon-plus" aria-hidden="true" />
          </button>
        </form>
      </Session>
      <div className="row">
        <ul className="col-xs-11 col-xs-offset-1">
        {this.state.universes.map(function(elem) {
          var trash =
            <a href="#" style={{marginLeft: "2em"}}
              onClick={this.destroyHandler}
              data-uid={elem.uid}>
              <span className="glyphicon glyphicon-trash" aria-hidden="true" />
            </a>;
          return <li key={elem.uid+elem.title}>
            <a href={"/universe/" + elem.uid}
              onClick={this.props.opts.hrefHandler}
              data-uid={elem.uid}>
              {elem.title || elem.uid}
            </a> {elem.title ? "(" + elem.uid + ")" : ""}
            {this.state.destroy === elem.uid ?
              <ConfirmBox payload={elem.uid} callback={this.destroyCallback}
              close={this.toggleDestroy}>{trash}</ConfirmBox> : trash}
          </li>;
        }.bind(this))}
        </ul>
      </div>
      {this.props.uid ?
        <Universe opts={opts} uid={this.props.uid} key={this.props.uid} /> :
        this.props.children[1]}
    </div>;
  }
});

