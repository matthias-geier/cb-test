var AddChannel = React.createClass({
  clickHandler: function(e) {
    var channels = this.refs.channel.value.split(/[,.;:]/).map(function(elem) {
      return elem.trim();
    });
    promise.post("/api/talk", JSON.stringify(channels),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      this.refs.channel.value = "";
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
    return <form className="form-inline">
      <input ref="channel" className="form-control" />
      <button type="submit" className="btn btn-default"
        onClick={this.clickHandler}>Add</button>
    </form>;
  }
});
