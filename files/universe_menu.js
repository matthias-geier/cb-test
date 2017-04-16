var UniverseMenu = React.createClass({displayName: "UniverseMenu",
  currentRoute: function() {
    var match = this.props.opts.reqUrl().match("^/universe/[^/]+/?([^/]+)");
    return match ? match[1] : "";
  },
  render: function() {
    var current = this.currentRoute();
    var menu_items = [["prop", "Props"], ["story", "Stories"]];
    var selected_index = menu_items.reduce(function(acc, elem, i) {
      if (elem[0] === current) { acc = i; }
      return acc;
    }, -1);
    return React.createElement("div", {className: "col-xs-12"}, 
      React.createElement("ul", {className: "nav nav-tabs", key: current, 
        style: {marginTop: "2em"}}, 
        menu_items.map(function(elem) {
          return React.createElement("li", {key: elem[0], role: "presentation", 
            className: current === elem[0] ? "active" : ""}, 
            React.createElement("a", {href: "#", onClick: this.props.callback(elem[1], elem[0])}, 
              elem[1]
            )
          );
        }.bind(this))
      ), 
      this.props.children[selected_index] || ""
    );
  }
});
