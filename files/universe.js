var Universes = React.createClass({displayName: "Universes",
  getInitialState: function() {
    return { universes: [] };
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
  clickHandler: function(e) {
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
        this.props.opts.addError(payload.body);
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
      React.createElement("h2", null, "Universes"), 
      React.createElement("form", {className: "form-inline"}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.clickHandler}, "New")
      ), 
      React.createElement("ul", null, 
      this.state.universes.map(function(elem) {
        return React.createElement("li", {key: elem.id+elem.title}, 
          React.createElement("a", {href: "/universe/" + elem.id, onClick: this.hrefHandler, 
            "data-id": elem.id}, 
            elem.title || elem.id
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
  update: function() {
    promise.get("/api/universe/" + this.props.id).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
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
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.id,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateUniverse();
        this.props.opts.updateUniverses();
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  charHrefHandler: function(e) {
    e.preventDefault();
    var char = e.target.innerHTML;
    var url = "/universe/" + this.props.id + "/character/" + char;
    window.history.pushState({}, char, url);
    var state = this.state;
    state.character = char;
    this.setState(state);
  },
  componentDidMount: function() {
    this.update();
    this.updateCharacter();
  },
  render: function() {
    if (!this.state.id) { return React.createElement("div", null); }
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.update,
      updateCharacter: this.updateCharacter
    };

    var universe = this.state;
    return React.createElement("div", null, 
      React.createElement("h3", null, universe.title || universe.id), 

      React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
        React.createElement("input", {className: "form-control", placeholder: "Universe title", ref: "title", 
          defaultValue: universe.title}), 
        React.createElement("input", {type: "submit", className: "btn btn-default", value: "Update"})
      ), 

      React.createElement("div", null, 
        universe.characters.map(function(elem) {
          return React.createElement("a", {href: "/universe/" + this.props.id + "/character/" + elem, 
            onClick: this.charHrefHandler}, 
            elem
          );
        }.bind(this))
      ), 
       this.state.character ?
        React.createElement(Character, {opts: opts, uid: this.props.id, id: this.state.character, 
          key: this.state.character}) :
        ""
    );
  }
});
