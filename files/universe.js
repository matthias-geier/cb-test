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
    var universe = e.target.innerHTML;
    this.props.opts.reroute("/universe/" + universe, universe);
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
        return React.createElement("li", {key: elem}, 
          React.createElement("a", {href: "#", onClick: this.hrefHandler}, elem)
        );
      }.bind(this))
      )
    );
  }
});

var Universe = React.createClass({displayName: "Universe",
  render: function() {
    return React.createElement("div", null, "gna");
  }
});
