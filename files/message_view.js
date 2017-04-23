var MessageView = React.createClass({displayName: "MessageView",
  render: function() {
    return React.createElement("div", null, 
      this.props.messages.map(function(elem, i) {
        return React.createElement("code", {key: i}, JSON.stringify(elem));
      }.bind(this))
    );
  }
});
