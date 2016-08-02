var ConfirmBox = React.createClass({displayName: "ConfirmBox",
  confirmHandler: function(e) {
    this.props.callback(this.props.payload);
  },
  closeHandler: function(e) {
    this.props.close();
  },
  render: function() {
    return React.createElement("div", {style: {display: "inline-block"}}, 
      this.props.children, 
      React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.confirmHandler}, 
        React.createElement("span", {className: "glyphicon glyphicon-ok", "aria-hidden": "true"})
      ), 
      React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.closeHandler}, 
        React.createElement("span", {className: "glyphicon glyphicon-remove", "aria-hidden": "true"})
      )
    );
  }
});
