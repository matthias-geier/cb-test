var RefreshBox = React.createClass({
  getInitialState: function() {
    return {};
  },
  toggleRefreshHandler: function(e) {
    e.preventDefault();
    this.toggleRefresh();
  },
  toggleRefresh: function() {
    var state = this.state;
    if (state.refresh) {
      delete(state.refresh);
    } else {
      state.refresh = true;
      this.refresh();
    }
    this.setState(state);
  },
  refresh: function() {
    if (!this.state.refresh) { return; }
    this.props.callback();
    setTimeout(this.refresh, 60000);
  },
  render: function() {
    return <div style={{display: "inline-block", marginLeft: "1em"}}>
      <a href="#" onClick={this.toggleRefreshHandler}
        style={{fontSize: "1.8em", color: this.state.refresh ? null : "black"}}
        title={this.state.refresh ? "Refresh is on" : "Refresh is off"}>
        <span className="glyphicon glyphicon-refresh" aria-hidden="true" />
      </a>
    </div>;
  }
});
