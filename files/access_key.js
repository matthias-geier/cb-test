var AccessKey = React.createClass({displayName: "AccessKey",
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
    this.toggleDestroy(e.currentTarget.dataset.accessKey);
  },
  toggleDestroy: function(key) {
    var state = this.state;
    if (state.destroy && !key) {
      delete(state.destroy);
    } else {
      state.destroy = key;
    }
    this.setState(state);
  },
  destroyCallback: function(key) {
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
    return React.createElement("div", null, 
      React.createElement("h4", {style: {display: "inline-block"}}, "Access Keys"), 
      React.createElement("form", {className: "form-inline", style: 
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.createHandler}, 
          React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
        )
      ), 
      this.state.access_keys.map(function(elem) {
        var trash =
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.destroyHandler, "data-access-key": elem, 
            style: {marginLeft: "0.5em"}}, 
            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
          );
        return React.createElement("div", {className: "control-group", key: elem}, 
          React.createElement("p", {style: {display: "inline-block"}}, 
            React.createElement("a", {href: "/key/" + elem}, elem), 
            this.state.destroy === elem ?
              React.createElement(ConfirmBox, {payload: elem, callback: this.destroyCallback, 
              close: this.toggleDestroy}, trash) : trash
          )
        );
      }.bind(this))
    );
  },
  render: function() {
    return React.createElement("div", {className: "col-xs-12 col-md-12"}, 
      React.createElement("div", {style: {display: "inline-block"}}, 
        React.createElement("a", {href: "#", onClick: this.toggleEditHandler}, 
          React.createElement("span", {style: {fontSize: "1.4em"}, 
            className: "glyphicon glyphicon-lock", "aria-hidden": "true"})
        )
      ), " ", React.createElement("div", {style: {display: "inline-block", marginLeft: "0.5em"}}, 
        this.props.children
      ), 

      this.state.editable ? this.renderEdit() : React.createElement("div", null)
    );
  }
})
