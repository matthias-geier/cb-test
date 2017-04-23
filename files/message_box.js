var MessageBox = React.createClass({displayName: "MessageBox",
  render: function() {
    return React.createElement("div", {style: {display: "inline-block", marginLeft: "2em"}}, 
      React.createElement("a", {href: "#", onClick: this.props.callback, 
        style: {fontSize: "1.8em", color: this.props.num > 0 ? null : "black"}, 
        title: this.props.num + " messages waiting"}, 
        React.createElement("span", {className: "glyphicon glyphicon-envelope", "aria-hidden": "true"})
      )
    );
  }
});
