var Props = React.createClass({displayName: "Props",
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
  propHrefHandler: function(e) {
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
    promise.post("/api" + url, JSON.stringify({pid: pid}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, pid, url + "/" + pid);
        var state = this.state;
        state.props.push(pid);
        state.props.sort();
        this.setState(state);
        this.toggleNew();
        this.updateProp();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    var pid = e.currentTarget.dataset.pid;
    var url = "/universe/" + this.props.uid + "/prop/" + pid;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closePropIf(pid);
        var state = this.state;
        state.props.splice(state.props.indexOf(pid), 1);
        this.setState(state);
      } else {
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
      return React.createElement("li", {key: elem+i}, 
        React.createElement("a", {href: "#", "data-pid": elem, 
          onClick: this.propHrefHandler}, elem), 
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
          "data-pid": elem}, 
          React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
        ), 
        propTag && elem == this.state.pid ? propTag : ""
      );
    }.bind(this));
  },
  renderNew: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.createNewHandler}, 
      React.createElement("input", {className: "form-control", ref: "pid", maxlength: "24", 
        placeholder: "id (only a-z and _)"}), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Create"})
    );
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateProp: this.updateProp
    };
    var propTag = this.state.pid ?
      React.createElement(Prop, {opts: opts, uid: this.props.uid, pid: this.state.pid, 
        key: this.state.pid}) :
      undefined;
    return React.createElement("div", {style: {border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}, className: "col-xs-12 col-md-12"}, 
      React.createElement("h3", {style: {display: "inline-block"}}, 
        React.createElement("a", {href: "#", onClick: this.propHrefHandler}, "Props")
      ), 
      React.createElement("form", {className: "form-inline", style: 
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.toggleNewHandler}, 
          React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
        )
      ), 
      this.state.create_new ? this.renderNew() : React.createElement("div", null), 

      React.createElement("ul", {className: "list-unstyled"}, this.renderPropList(propTag))
    );
  }
});

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
    return pairs.map(function(key_pair) {
      return React.createElement("div", {className: "row", key: key_pair}, 
        key_pair.map(function(key, i) {
          return React.createElement("div", {className: "col-xs-6 col-md-6", key: key}, 
            React.createElement("blockquote", {className: i%2 === 1 ? "blockquote-reverse" : ""}, 
              React.createElement("p", {style: {whiteSpace: "pre-line"}, dangerouslySetInnerHTML: 
                this.renderText(this.state.prop[key])}), 
              React.createElement("footer", {style: {fontVariant: "small-caps"}}, key)
            )
          );
        }.bind(this))
      );
    }.bind(this));
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
    return React.createElement("div", {className: "col-xs-12 col-md-12"}, 
      React.createElement("h3", {style: {display: "inline-block", textTransform: "uppercase"}}, 
        prop.pid
      ), 
      React.createElement("form", {className: "form-inline", style: 
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.toggleEditHandler}, 
          React.createElement("span", {className: "glyphicon glyphicon-pencil", "aria-hidden": "true"})
        )
      ), 
      this.state.editable ? this.renderEditable() : this.renderPlain()
    );
  }
});

