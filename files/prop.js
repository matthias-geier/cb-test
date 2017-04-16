var Prop = React.createClass({displayName: "Prop",
  getInitialState: function() {
    return {};
  },
  propUrl: function() {
    return "/universe/" + this.props.uid + "/prop/" + this.props.pid;
  },
  update: function() {
    promise.get("/api" + this.propUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.prop = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
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
    promise.put("/api" + this.propUrl(), JSON.stringify(data),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        var state = this.state;
        state.prop = payload.body;
        this.setState(state);
        this.filterUnused(Object.keys(payload.body));
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  addFieldHandler: function(e) {
    e.preventDefault();
    var state = this.state.prop;
    for(var i = 1; ; i++) {
      if (Object.keys(state).indexOf("new field " + i) > -1) { continue; }
      state["new field " + i] = "";
      break;
    }
    this.setState(state);
  },
  componentDidMount: function() {
    this.update();
  },
  filterUnused: function(fieldset) {
    var unused = this.editableFields().filter(function(elem) {
      return fieldset.indexOf(elem) === -1;
    });
    var state = this.state;
    unused.forEach(function(elem) { delete(state.prop[elem]) });
    this.setState(state);
  },
  editableFields: function() {
    var blocked = ["pid", "uid", "updated_at", "editable"];
    return Object.keys(this.state.prop).filter(function(val) {
      return blocked.indexOf(val) === -1;
    });
  },
  renderPlain: function() {
    var pairs = [];
    this.editableFields().forEach(function(key, i) {
      if (i%2 === 0) {
        pairs.push([key]);
      } else {
        pairs[pairs.length - 1].push(key);
      }
    });
    return React.createElement("div", {className: "row"}, 
      this.editableFields().map(function(field, i) {
        return React.createElement("div", {className: "col-xs-12 col-md-3", key: field}, 
          React.createElement("blockquote", {className: i%2 === 1 ? "blockquote-reverse" : ""}, 
            React.createElement("p", {style: {whiteSpace: "pre-line"}, dangerouslySetInnerHTML: 
              this.renderText(this.state.prop[field])}), 
            React.createElement("footer", {style: {fontVariant: "small-caps"}}, field)
          )
        );
      }.bind(this))
    );
  },
  renderText: function(text) {
    text = String(text).
      replace(/&/g, "&amp;").
      replace(/</g, "&lt;").
      replace(/>/g, "&gt;").
      replace(/"/g, "&quot;").
      replace(/'/g, "&#039;").
      replace(/\//g, "&#x2F;");
    return {__html: text };
  },
  renderEditable: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
      React.createElement("table", {className: "table table-hover"}, React.createElement("tbody", null, 
        this.editableFields().map(function(key, i) {
          return React.createElement("tr", {key: key}, 
            React.createElement("td", {style: {width: "25%"}}, React.createElement("input", {className: "form-control", 
              ref: "key"+i, defaultValue: key})), 
            React.createElement("td", null, React.createElement("textarea", {className: "form-control", 
              ref: "value"+i, rows: "3", style: {width: "70%"}, 
              defaultValue: this.state.prop[key]}))
          );
        }.bind(this))
      )), 
      React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.addFieldHandler}, 
        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
      ), 
      React.createElement("input", {type: "submit", className: "btn btn-default input-sm", value: "Save"})
    );
  },
  render: function() {
    if (!this.state.prop) { return React.createElement("div", null); }

    var prop = this.state.prop;
    return React.createElement("div", {className: "row"}, 
      React.createElement("div", {className: "col-xs-12"}, 
      React.createElement("h3", {style: {display: "inline-block", textTransform: "uppercase"}}, 
        prop.pid
      ), 
      this.props.opts.can("write") ?
        React.createElement("form", {className: "form-inline", style: {display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}, 
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.toggleEditHandler, title: "Edit"}, 
            React.createElement("span", {className: "glyphicon glyphicon-edit", "aria-hidden": "true"})
          )
        ) :
        "", 
      this.state.editable ? this.renderEditable() : this.renderPlain()
      )
    );
  }
});

