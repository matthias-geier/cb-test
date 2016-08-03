var ConfirmBox = React.createClass({
  confirmHandler: function(e) {
    e.preventDefault();
    this.props.callback(this.props.payload);
    this.props.close();
  },
  closeHandler: function(e) {
    e.preventDefault();
    this.props.close();
  },
  render: function() {
    return <div style={{display: "inline-block"}}>
      {this.props.children}
      <a href="#" style={{marginLeft: "2em"}} onClick={this.confirmHandler}>
        <span className="glyphicon glyphicon-ok" aria-hidden="true" />
      </a>
      <a href="#" style={{marginLeft: "2em"}} onClick={this.closeHandler}>
        <span className="glyphicon glyphicon-remove" aria-hidden="true" />
      </a>
    </div>;
  }
});
