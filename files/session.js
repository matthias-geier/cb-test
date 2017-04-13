var Session = React.createClass({displayName: "Session",
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
    promise.post("/api/session", JSON.stringify({access_keys: access_keys}),
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
    return React.createElement("div", {className: "row"}, 
      React.createElement("form", {className: "col-md-6"}, 
      React.createElement("div", {className: "form-group"}, 
        React.createElement("label", {className: "control-label"}, "Access keys"), 
        React.createElement("textarea", {ref: "access_keys", className: "form-control", 
          defaultValue: this.state.access_keys.join("\n")})
      ), 
      React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.saveHandler}, "Save")
    )
    );
  },
  render: function() {
    return React.createElement("div", {className: "col-xs-12 col-md-12"}, 
      React.createElement("div", {style: {display: "inline-block"}}, 
        React.createElement("a", {href: "#", onClick: this.toggleEditHandler}, 
          React.createElement("span", {style: {fontSize: "2em"}, 
            className: "glyphicon glyphicon-user", "aria-hidden": "true"})
        )
      ), " ", React.createElement("div", {style: {display: "inline-block", marginLeft: "0.5em"}}, 
        this.props.children
      ), 

      this.state.editable ? this.renderEdit() : React.createElement("div", null)
    );
  }
})
