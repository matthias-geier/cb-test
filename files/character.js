var Character = React.createClass({displayName: "Character",
  getInitialState: function() {
    return {};
  },
  charUrl: function() {
    return "/universe/" + this.props.uid + "/character/" + this.props.id;
  },
  update: function() {
    promise.get("/api" + this.charUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
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
    for(var i = 0; ; i++) {
      if (!this.refs["key"+i]) { break; }
      data[this.refs["key"+i].value] = this.refs["value"+i].value;
    }
    promise.put("/api" + this.charUrl(), JSON.stringify(data),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        this.setState(payload.body);
        this.filterUnused(Object.keys(payload.body));
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  addFieldHandler: function(e) {
    e.preventDefault();
    var state = this.state;
    state["new field"] = "";
    this.setState(state);
  },
  componentDidMount: function() {
    this.update();
  },
  filterUnused: function(fieldset) {
    var unused = this.editableFields().filter(function(elem) {
      return !fieldset.includes(elem);
    });
    var state = this.state;
    unused.forEach(function(elem) { delete(state[elem]) });
    this.setState(state);
  },
  editableFields: function() {
    var blocked = ["id", "cid", "uid", "updated_at", "editable"];
    return Object.keys(this.state).filter(function(val) {
      return !blocked.includes(val);
    });
  },
  renderPlain: function() {
    return React.createElement("table", {className: "table table-hover"}, React.createElement("tbody", null, 
      this.editableFields().map(function(key) {
        return React.createElement("tr", null, React.createElement("td", null, key), React.createElement("td", null, this.state[key]));
      }.bind(this))
    ));
  },
  renderEditable: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
      React.createElement("table", {className: "table table-hover"}, React.createElement("tbody", null, 
        this.editableFields().map(function(key, i) {
          return React.createElement("tr", {key: key}, 
            React.createElement("td", null, React.createElement("input", {className: "form-control", ref: "key"+i, 
              defaultValue: key})), 
            React.createElement("td", null, React.createElement("input", {className: "form-control", ref: "value"+i, 
              defaultValue: this.state[key]}))
          );
        }.bind(this))
      )), 
      React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.addFieldHandler}, "+"), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Save"})
    );
  },
  render: function() {
    if (!this.state.id) { return React.createElement("div", null); }

    var char = this.state;
    return React.createElement("div", null, 
      React.createElement("h3", null, char.cid, " ", React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.toggleEdit}, "edit")), 
      this.state.editable ? this.renderEditable() : this.renderPlain()
    );
  }
});

