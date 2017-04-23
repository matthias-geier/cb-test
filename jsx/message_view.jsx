var MessageView = React.createClass({
  render: function() {
    return <div>
      {this.props.messages.map(function(elem, i) {
        return <code key={i}>{JSON.stringify(elem)}</code>;
      }.bind(this))}
    </div>;
  }
});
