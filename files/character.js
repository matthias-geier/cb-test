var Characters = React.createClass({displayName: "Characters",
  getInitialState: function() {
    return {};
  },
  updateCharacter: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().
      match("^\/universe\/[^\/]+\/character\/([^\/]+)");
    if (match) {
      if (match[1] !== state.character) {
        state.character = match[1];
        this.setState(state);
      }
    } else {
      if ("character" in state) {
        delete(state.character);
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
  closeCharacterIf: function(character) {
    if (character && this.state.character !== character) {
      return;
    }
    window.history.pushState({}, this.props.uid,
      "/universe/" + this.props.uid);
    this.updateCharacter();
  },
  charHrefHandler: function(e) {
    e.preventDefault();
    var char = e.target.innerHTML;
    var url = "/universe/" + this.props.uid + "/character/" + char;
    window.history.pushState({}, char, url);
    var state = this.state;
    state.character = char;
    this.setState(state);
  },
  createNewHandler: function(e) {
    e.preventDefault();
    var char = this.refs.id.value;
    var url = "/universe/" + this.props.uid + "/character";
    promise.post("/api" + url, JSON.stringify({cid: char}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, char, url + "/" + char);
        var state = this.state;
        state.characters.push(char);
        this.setState(state);
        this.toggleNew();
        this.updateCharacter();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    var char = e.currentTarget.dataset.character;
    var url = "/universe/" + this.props.uid + "/character/" + char;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closeCharacterIf(char);
        var state = this.state;
        state.characters.splice(state.characters.indexOf(char), 1);
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentWillMount: function() {
    var state = this.state;
    state.characters = this.props.characters;
    this.setState(state);
  },
  componentDidMount: function() {
    this.updateCharacter();
  },
  renderCharList: function() {
    return this.state.characters.map(function(elem, i) {
      return React.createElement("li", {key: elem+i}, 
        React.createElement("a", {href: "/universe/" + this.props.id + "/character/" + elem, 
          onClick: this.charHrefHandler}, elem), 
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
          "data-character": elem}, 
          React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
        )
      );
    }.bind(this));
  },
  renderNew: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.createNewHandler}, 
      React.createElement("input", {className: "form-control", ref: "id", 
        placeholder: "id (only a-z and _)"}), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Create"})
    );
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateCharacter: this.updateCharacter
    };
    return React.createElement("div", {style: {border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white", padding: "0.5em"}}, 
      React.createElement("h3", {style: {display: "inline-block"}}, "Characters"), 
      React.createElement("form", {className: "form-inline", style: 
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.toggleNewHandler}, 
          React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
        )
      ), 
       this.state.create_new ? this.renderNew() : React.createElement("div", null), 

      React.createElement("ul", {className: "list-unstyled"}, this.renderCharList()), 
       this.state.character ?
        React.createElement(Character, {opts: opts, uid: this.props.uid, id: this.state.character, 
          key: this.state.character}) :
        ""
    );
  }
});

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
        var state = this.state;
        state.character = payload.body;
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
    promise.put("/api" + this.charUrl(), JSON.stringify(data),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        var state = this.state;
        state.character = payload.body;
        this.setState(state);
        this.filterUnused(Object.keys(payload.body));
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  addFieldHandler: function(e) {
    e.preventDefault();
    var state = this.state.character;
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
    unused.forEach(function(elem) { delete(state.character[elem]) });
    this.setState(state);
  },
  editableFields: function() {
    var blocked = ["id", "cid", "uid", "updated_at", "editable"];
    return Object.keys(this.state.character).filter(function(val) {
      return blocked.indexOf(val) === -1;
    });
  },
  renderPlain: function() {
    return React.createElement("table", {className: "table table-hover"}, React.createElement("tbody", null, 
      this.editableFields().map(function(key) {
        return React.createElement("tr", {key: key}, 
          React.createElement("td", null, key), React.createElement("td", null, this.state.character[key])
        );
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
              defaultValue: this.state.character[key]}))
          );
        }.bind(this))
      )), 
      React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.addFieldHandler}, 
        React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
      ), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Save"})
    );
  },
  render: function() {
    if (!this.state.character) { return React.createElement("div", null); }

    var char = this.state.character;
    return React.createElement("div", null, 
      React.createElement("h3", null, char.cid, " ", React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.toggleEdit}, 
        React.createElement("span", {className: "glyphicon glyphicon-pencil", "aria-hidden": "true"})
      )), 
      this.state.editable ? this.renderEditable() : this.renderPlain()
    );
  }
});

