var AccessKey = React.createClass({
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
  createHandler: function(e) {
    e.preventDefault();
    promise.post("/api/universe/" + this.props.uid + "/access_key", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.access_keys = payload.body.access_keys;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    var key = e.currentTarget.dataset.accessKey;
    promise.del("/api/universe/" + this.props.uid + "/access_key",
      JSON.stringify({access_key: key}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
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
          onClick={this.createHandler}>
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
        </button>
      </form>
      {this.state.access_keys.map(function(elem) {
        return <div className="control-group" key={elem}>
          <p style={{display: "inline-block"}}>
            <a href={"/key/" + elem}>{elem}</a>
          </p>
          <button type="submit" className="btn btn-default"
            onClick={this.destroyHandler} data-access-key={elem}
            style={{marginLeft: "0.5em"}}>
            <span className="glyphicon glyphicon-trash" aria-hidden="true" />
          </button>
        </div>;
      }.bind(this))}
    </div>;
  },
  render: function() {
    return <div className="col-xs-12 col-md-12">
      <div style={{display: "inline-block"}}>
        <a href="#" onClick={this.toggleEditHandler}>
          <span style={{fontSize: "1.4em"}}
            className="glyphicon glyphicon-lock" aria-hidden="true" />
        </a>
      </div> <div style={{display: "inline-block", marginLeft: "0.5em"}}>
        {this.props.children}
      </div>

      {this.state.editable ? this.renderEdit() : <div />}
    </div>;
  }
})
