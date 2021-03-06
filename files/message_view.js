var MessageView = React.createClass({displayName: "MessageView",
  openUrl: function(e) {
    e.preventDefault();
    this.props.toggle(e);
    window.history.pushState({}, e.currentTarget.dataset.uid,
      e.currentTarget.href);
    this.props.opts.updateUniverse();
  },
  link: function(data) {
    if (data.action === "delete") { return ""; }
    var url = "/universe/" + data.uid;
    if (data.sid) {
      url += "/story/" + data.sid;
    } else if (data.pid) {
      url += "/prop/" + data.pid;
    }
    return React.createElement("a", {href: url, onClick: this.openUrl, "data-uid": data.uid, 
      style: {fontSize: "1em"}, title: "Link to " + data.scope}, 
      React.createElement("span", {className: "glyphicon glyphicon-share", "aria-hidden": "true"})
    );
  },
  timeDiff: function(data) {
    var a = new Date(data.broadcasted_at);
    var b = new Date();
    var diff = (b - a) / 1000;
    var range = [["seconds", 1], ["minutes", 60], ["hours", 60], ["days", 24]];
    var result = range.reduce(function(acc, r) {
      if (acc[2]) { return acc; }
      if (acc[0] / r[1] < 1.0) { return [acc[0], acc[1], acc[1]]; }
      return [acc[0] / r[1], r[0], undefined];
    }, [diff, undefined, undefined]);
    return parseInt(result[0]) + " " + result[1] + " ago";
  },
  render: function() {
    var no_props = ["uid", "sid", "pid", "broadcasted_at", "who", "action",
      "scope"];
    return React.createElement("div", null, 
      this.props.messages.map(function(elem, i) {
        return React.createElement("blockquote", {
          key: elem.action+elem.uid+elem.scope+elem.sid+elem.pid}, 
          React.createElement("p", {style: {whiteSpace: "pre-line"}}, 
            elem.action + "d", " ", elem.scope, React.createElement("br", null), 
            Object.keys(elem).sort().filter(function(e) {
              return no_props.indexOf(e) < 0;
            }).map(function(e) {
              return React.createElement("span", {key: e, style: {paddingLeft: "0.4em"}}, 
                e.replace(/\b\w/g, function(l){ return l.toUpperCase() }), ":", 
                elem[e]
              );
            })
          ), 
          React.createElement("footer", {style: {fontVariant: "small-caps"}}, 
            "made by ", elem.who[0], " about ", this.timeDiff(elem), " ", this.link(elem)
          )
        );
      }.bind(this))
    );
  }
});
