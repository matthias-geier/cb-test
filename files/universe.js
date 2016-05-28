var Universes = React.createClass({displayName: "Universes",
  getInitialState: function() {
    return { universes: [] };
  },
  closeUniverseIf: function(universe) {
    if (universe && this.state.universe !== universe) {
      return;
    }
    window.history.pushState({}, "/", "/");
    this.updateUniverse();
  },
  update: function() {
    promise.get("/api/universe").then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.universes = payload.body;
        this.setState(state);
      }
    }.bind(this));
  },
  updateUniverse: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().match("^\/universe\/([^\/]+)");
    if (match) {
      if (match[1] !== state.universe) {
        state.universe = match[1];
        this.setState(state);
      }
    } else {
      if ("universe" in state) {
        delete(state.universe);
        this.setState(state);
      }
    }
  },
  createHandler: function(e) {
    e.preventDefault();
    promise.post("/api/universe", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, payload.body.id,
          "/universe/" + payload.body.id);
        this.update();
        var state = this.state;
        state.universe = payload.body.id;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var universe = e.target.dataset.id;
    var url = "/universe/" + universe;
    window.history.pushState({}, e.target.innerHTML, url);
    var state = this.state;
    state.universe = universe;
    this.setState(state);
  },
  hrefResetHandler: function(e) {
    e.preventDefault();
    window.history.pushState({}, "/", "/");
    var state = this.state;
    delete(state.universe);
    this.setState(state);
  },
  destroyHandler: function(e) {
    e.preventDefault();
    var universe = e.currentTarget.dataset.universe;
    var url = "/universe/" + universe;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closeUniverseIf(universe);
        this.update();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentDidMount: function() {
    this.update();
    this.updateUniverse();
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverses: this.update,
      updateUniverse: this.updateUniverse
    };
    return React.createElement("div", null, 
      React.createElement(Session, {opts: opts}, 
        React.createElement("h2", {style: {display: "inline-block"}}, 
          React.createElement("a", {href: "#", onClick: this.hrefResetHandler}, "Universes")
        ), 
        React.createElement("form", {className: "form-inline", style: {display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}, 
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.createHandler}, 
            React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
          )
        )
      ), 
      React.createElement("ul", null, 
      this.state.universes.map(function(elem) {
        return React.createElement("li", {key: elem.id+elem.title}, 
          React.createElement("a", {href: "/universe/" + elem.id, onClick: this.hrefHandler, 
            "data-id": elem.id}, 
            elem.title || elem.id
          ), 
          React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
            "data-universe": elem.id}, 
            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
          )
        );
      }.bind(this))
      ), 
       this.state.universe ?
        React.createElement(Universe, {opts: opts, id: this.state.universe, 
          key: this.state.universe}) :
        ""
    );
  }
});

var Universe = React.createClass({displayName: "Universe",
  getInitialState: function() {
    return {};
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
  currentRoute: function() {
    var match = this.props.opts.reqUrl().match("^/universe/[^/]+/?([^/]+)");
    return match ? match[1] : "";
  },
  update: function() {
    promise.get("/api/universe/" + this.props.id).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.id,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateUniverse();
        this.props.opts.updateUniverses();
        this.toggleEdit();
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  handleHref: function(title, url_partial) {
    return function(e) {
      e.preventDefault();
      window.history.pushState({}, title,
        "/universe/" + this.props.id + "/" + url_partial);
      this.forceUpdate();
    }.bind(this);
  },
  componentDidMount: function() {
    this.update();
  },
  renderEdit: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
      React.createElement("input", {className: "form-control", placeholder: "Universe title", ref: "title", 
        defaultValue: this.state.title}), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Update"})
    );
  },
  renderMenu: function() {
    var current = this.currentRoute();
    var menu_items = [["character", "Characters"], ["story", "Stories"]];
    return React.createElement("ul", {className: "nav nav-tabs", key: current, 
      style: {marginTop: "2em"}}, 
      menu_items.map(function(elem) {
        return React.createElement("li", {key: elem[0], role: "presentation", className: 
          current === elem[0] ? "active" : ""}, 
          React.createElement("a", {href: "#", onClick: this.handleHref(elem[1], elem[0])}, elem[1])
        );
      }.bind(this))
    );
  },
  render: function() {
    if (!this.state.id) { return React.createElement("div", null); }
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.update
    };

    var universe = this.state;
    var title = universe.title || universe.id;
    var current = this.currentRoute();
    return React.createElement("div", null, 
      React.createElement(AccessKey, {uid: universe.id, opts: opts}, 
        React.createElement("h3", {style: {display: "inline-block"}}, 
          React.createElement("a", {href: "#", onClick: this.handleHref(title, "")}, title)
        ), 

        React.createElement("form", {className: "form-inline", style: {display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}, 
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.toggleEditHandler}, 
            React.createElement("span", {className: "glyphicon glyphicon-pencil", "aria-hidden": "true"})
          )
        )
      ), 
      this.state.editable ? this.renderEdit() : React.createElement("div", null), 

      this.renderMenu(), 

      current === "character" ?
        React.createElement(Characters, {uid: this.props.id, characters: universe.characters, 
          opts: opts, key: "c" + universe.characters.
          map(function(elem) { return elem.updated_at; } ).join("")}) :
        "", 

      current === "story" ?
        React.createElement(Stories, {uid: this.props.id, stories: universe.stories, 
          opts: opts, key: "s" + universe.stories.
          map(function(elem) { return elem.updated_at; } ).join("")}) :
        ""
    );
  }
});
