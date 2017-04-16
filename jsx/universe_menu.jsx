var UniverseMenu = React.createClass({
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
    return <div className="col-xs-12">
      <ul className="nav nav-tabs" key={current}
        style={{marginTop: "2em"}}>
        {menu_items.map(function(elem) {
          return <li key={elem[0]} role="presentation"
            className={current === elem[0] ? "active" : ""}>
            <a href="#" onClick={this.props.callback(elem[1], elem[0])}>
              {elem[1]}
            </a>
          </li>;
        }.bind(this))}
      </ul>
      {this.props.children[selected_index] || ""}
    </div>;
  }
});
