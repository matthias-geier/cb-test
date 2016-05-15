var ChannelItem = React.createClass({displayName: "ChannelItem",
  clickHandler: function(e) {
    promise.del("/api/talk", JSON.stringify([this.props.name]),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateChannels();
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
    e.preventDefault();
  },
  render: function() {
    return React.createElement("li", null, 
      React.createElement("a", {href: "#", onClick: this.clickHandler}, this.props.name)
    );
  }
});
