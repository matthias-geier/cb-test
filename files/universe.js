var Universes = React.createClass({displayName: "Universes",
  getInitialState: function() {
    return { universes: [] };
  },
  closeUniverseIf: function(uid) {
    if (uid && this.state.uid !== uid) {
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
      if (match[1] !== state.uid) {
        state.uid = match[1];
        this.setState(state);
      }
    } else {
      if ("uid" in state) {
        delete(state.uid);
        this.setState(state);
      }
    }
  },
  createHandler: function(e) {
    e.preventDefault();
    promise.post("/api/universe", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 201) {
        window.history.pushState({}, payload.body.uid,
          "/universe/" + payload.body.uid);
        this.update();
        var state = this.state;
        state.uid = payload.body.uid;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var uid = e.target.dataset.uid;
    var url = "/universe/" + uid;
    window.history.pushState({}, e.target.innerHTML, url);
    var state = this.state;
    state.uid = uid;
    this.setState(state);
  },
  hrefResetHandler: function(e) {
    e.preventDefault();
    window.history.pushState({}, "/", "/");
    var state = this.state;
    delete(state.uid);
    this.setState(state);
  },
  destroyHandler: function(e) {
    e.preventDefault();
    this.toggleDestroy(e.currentTarget.dataset.uid);
  },
  toggleDestroy: function(uid) {
    var state = this.state;
    if (state.destroy && !uid) {
      delete(state.destroy);
    } else {
      state.destroy = uid;
    }
    this.setState(state);
  },
  destroyCallback: function(uid) {
    var url = "/universe/" + uid;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      if (xhr.status === 204) {
        this.closeUniverseIf(uid);
        this.update();
      } else {
        var payload = JSON.parse(text);
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
    return React.createElement("div", {className: "row"}, 
      React.createElement(Session, {opts: opts}, 
        React.createElement("h1", {style: {display: "inline-block", lineHeight: 1.5, fontSize: "4em"}}, 
          React.createElement("a", {href: "#", onClick: this.hrefResetHandler}, 
            React.createElement("span", {style: {textTransform: "uppercase"}}, "rpuniverse"), 
            React.createElement("span", {style: {fontVariant: "small-caps"}}, ".org")
          )
        ), 
        React.createElement("form", {className: "form-inline", style: {display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}, 
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.createHandler}, 
            React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
          )
        )
      ), 
      React.createElement("ul", {className: "col-xs-11 col-xs-offset-1 col-md-11 col-md-offset-1"}, 
      this.state.universes.map(function(elem) {
        var trash =
          React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
            "data-uid": elem.uid}, 
            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
          );
        return React.createElement("li", {key: elem.uid+elem.title}, 
          React.createElement("a", {href: "/universe/" + elem.uid, onClick: this.hrefHandler, 
            "data-uid": elem.uid}, 
            elem.title || elem.uid
          ), 
          this.state.destroy === elem.uid ?
            React.createElement(ConfirmBox, {payload: elem.uid, callback: this.destroyCallback, 
            close: this.toggleDestroy}, trash) : trash
        );
      }.bind(this))
      ), 
       this.state.uid ?
        React.createElement(Universe, {opts: opts, uid: this.state.uid, 
          key: this.state.uid}) :
        React.createElement(Landing, null)
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
    promise.get("/api/universe/" + this.props.uid).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.universe = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.uid,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateUniverse();
        this.props.opts.updateUniverses();
        this.toggleEdit();
        var state = this.state;
        state.universe = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  fileSelectedHandler: function(e) {
    e.preventDefault();
    var reader = new FileReader();
    var file = this.refs.uploadbox.files[0];
    reader.onloadend = function(e) {
      promise.post("/api/universe/" + this.props.uid + "/restore",
        JSON.stringify({data: JSON.parse(e.target.result)}),
        { "Content-Type": "application/json" }).then(function(err, text, xhr) {

        var payload = JSON.parse(text);
        if (payload.status === 200) {
          window.location.assign("/universe/" + this.props.uid);
        } else {
          this.props.opts.addError(payload.body || payload.error);
        }
      }.bind(this));
    }.bind(this);
    reader.readAsText(file);
  },
  selectFileHandler: function(e) {
    e.preventDefault();
    this.refs.uploadbox.click();
  },
  backupHandler: function(e) {
    e.preventDefault();
    window.location.assign("/api/universe/" + this.props.uid + "/backup");
  },
  handleHref: function(title, url_partial) {
    return function(e) {
      e.preventDefault();
      window.history.pushState({}, title,
        "/universe/" + this.props.uid + "/" + url_partial);
      this.forceUpdate();
    }.bind(this);
  },
  componentDidMount: function() {
    this.update();
  },
  renderEdit: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
      React.createElement("input", {className: "form-control", placeholder: "Universe title", ref: "title", 
        defaultValue: this.state.universe.title}), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Update"})
    );
  },
  renderMenu: function() {
    var current = this.currentRoute();
    var menu_items = [["prop", "Props"], ["story", "Stories"]];
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
    if (!this.state.universe) { return React.createElement("div", null); }
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.update
    };

    var universe = this.state.universe;
    var title = universe.title || universe.uid;
    var current = this.currentRoute();
    return React.createElement("div", {className: "col-xs-12 col-md-12", style: {backgroundColor: "#e5e5e5", minHeight: "50%", borderRadius: "5px"}}, 
      React.createElement(AccessKeys, {uid: universe.uid, opts: opts, 
        access_keys: this.state.universe.access_keys}, 
        React.createElement("h2", {style: {display: "inline-block"}}, 
          React.createElement("a", {href: "#", onClick: this.handleHref(title, "")}, title)
        ), 
        React.createElement("div", {style: {display: "inline-block", marginLeft: "0.6em"}}, 
          React.createElement("a", {href: "#", onClick: this.backupHandler}, 
            React.createElement("span", {style: {fontSize: "1.8em"}, 
              className: "glyphicon glyphicon-download", "aria-hidden": "true"})
          )
        ), 
        React.createElement("div", {style: {display: "inline-block", marginLeft: "0.6em"}}, 
          React.createElement("a", {href: "#", onClick: this.selectFileHandler}, 
            React.createElement("span", {style: {fontSize: "1.8em"}, 
              className: "glyphicon glyphicon-upload", "aria-hidden": "true"})
          ), 
          React.createElement("input", {type: "file", className: "hidden", ref: "uploadbox", 
            onChange: this.fileSelectedHandler})
        ), 

        React.createElement("form", {className: "form-inline", style: {display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}, 
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.toggleEditHandler}, 
            React.createElement("span", {className: "glyphicon glyphicon-edit", "aria-hidden": "true"})
          )
        )
      ), 
      this.state.editable ? this.renderEdit() : React.createElement("div", null), 

      this.renderMenu(), 

      current === "prop" ?
        React.createElement(Props, {uid: this.props.uid, props: universe.props, 
          opts: opts, key: "c" + universe.props.
          map(function(elem) { return elem.updated_at; } ).join("")}) :
        "", 

      current === "story" ?
        React.createElement(Stories, {uid: this.props.uid, stories: universe.stories, 
          opts: opts, key: "s" + universe.stories.
          map(function(elem) { return elem.updated_at; } ).join("")}) :
        ""
    );
  }
});
