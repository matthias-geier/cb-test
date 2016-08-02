var ConfirmBox = React.createClass({
  confirmHandler: function(e) {
    this.props.callback(this.props.payload);
  },
  closeHandler: function(e) {
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
