var MessageBox = React.createClass({
  render: function() {
    return <div style={{display: "inline-block", marginLeft: "2em"}}>
      <a href="#" onClick={this.props.callback}
        style={{fontSize: "1.8em", color: this.props.num > 0 ? null : "black"}}
        title={this.props.num + " messages waiting"}>
        <span className="glyphicon glyphicon-envelope" aria-hidden="true" />
      </a>
    </div>;
  }
});
