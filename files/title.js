var Title = React.createClass({displayName: "Title",
  getInitialState: function() {
    return {};
  },
  updateUniverse: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().match("^\/universe\/([^\/]+)");
    if (match) {
      if (match[1] !== state.uid) {
        state.uid = match[1];
        this.setState(state);
      }
    } else {
      if ("uid" in state) {
        delete(state.uid);
        this.setState(state);
      }
    }
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var uid = e.target.dataset.uid;
    var url = "/universe/" + uid;
    if (uid) {
      window.history.pushState({}, e.target.innerHTML, url);
    } else {
      window.history.pushState({}, "/", "/");
    }
    this.updateUniverse();
  },
  componentDidMount: function() {
    this.updateUniverse();
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.updateUniverse,
      hrefHandler: this.hrefHandler
    };
    return React.createElement("div", {className: "row"}, 
      React.createElement(UniverseList, {opts: opts, uid: this.state.uid}, 
        React.createElement("h1", {style: {display: "inline-block", lineHeight: 1.5, fontSize: "4em"}}, 
          React.createElement("a", {href: "#", onClick: this.hrefHandler}, 
            React.createElement("span", {style: {textTransform: "uppercase"}}, "rpuniverse"), 
            React.createElement("span", {style: {fontVariant: "small-caps"}}, ".org")
          )
        ), 
        React.createElement(Landing, null)
      )
    );
  }
});
