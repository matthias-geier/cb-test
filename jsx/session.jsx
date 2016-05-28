var Session = React.createClass({
  getInitialState: function() {
    return {};
  },
  toggleEditHandler: function(e) {
    e.preventDefault();
    promise.get("/api/session").then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.access_keys = payload.body;
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
  saveHandler: function(e) {
    e.preventDefault();
    var access_keys = this.refs.access_keys.value.split("\n");
    promise.post("/api/session", JSON.stringify({keys: access_keys}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        this.props.opts.updateUniverses();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  renderEdit: function() {
    return <div className="row">
      <form className="col-md-6">
      <div className="form-group">
        <label className="control-label">Access keys</label>
        <textarea ref="access_keys" className="form-control"
          defaultValue={this.state.access_keys.join("\n")} />
      </div>
      <button type="submit" className="btn btn-default"
        onClick={this.saveHandler}>Save</button>
    </form>
    </div>;
  },
  render: function() {
    return <div>
      <div style={{display: "inline-block"}}>
        <a href="#" onClick={this.toggleEditHandler}>
          <span className="glyphicon glyphicon-user" aria-hidden="true" />
        </a>
      </div> <div style={{display: "inline-block", marginLeft: "0.5em"}}>
        {this.props.children}
      </div>

      {this.state.editable ? this.renderEdit() : <div />}
    </div>;
  }
})
