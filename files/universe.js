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
  clickHandler: function(e) {
    console.log(e.target);
    promise.post("/api/universe", undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.update();
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
    e.preventDefault();
  },
  hrefHandler: function(e) {
    var universe = e.target.dataset.id;
    this.props.opts.reroute("/universe/" + universe, universe);
    this.forceUpdate();
    e.preventDefault();
  },
  componentDidMount: function() {
    this.update();
  },
  render: function() {
    return React.createElement("div", null, 
      React.createElement("h2", null, "Universes"), 
      React.createElement("form", {className: "form-inline"}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.clickHandler}, "New")
      ), 
      React.createElement("ul", null, 
      this.state.universes.map(function(elem) {
        return React.createElement("li", {key: elem.id}, 
          React.createElement("a", {href: "#", onClick: this.hrefHandler, "data-id": elem.id}, 
            elem.title || elem.id
          )
        );
      }.bind(this))
      )
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
      var state = this.state;
      if (payload.status === 200) {
        state.universe = payload.body;
      } else {
        state = {};
        this.props.opts.addError(payload.body);
      }
      this.setState(state);
    }.bind(this));
  },
  updateHandler: function(e) {
    e.preventDefault();
    promise.put("/api/universe/" + this.props.id,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  hrefHandler: function(e) {
    var universe = e.target.innerHTML;
    this.props.opts.reroute("/universe/" + universe, universe);
    this.forceUpdate();
    e.preventDefault();
  },
  componentDidMount: function() {
    this.update();
  },
  render: function() {
    if (!this.state.universe) { return React.createElement("div", null); }

    var universe = this.state.universe;
    return React.createElement("div", null, 
      React.createElement("h3", null, universe.title || universe.id), 

      React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
        React.createElement("input", {placeholder: "Universe title", ref: "title", 
          defaultValue: universe.title}), 
        React.createElement("input", {type: "submit", className: "btn btn-default", value: "Update"})
      ), 

      React.createElement("div", null, 
        universe.characters.map(function(elem) {
          return React.createElement("a", {href: "#"}, elem);
        }.bind(this))
      )
    );
  }
});
