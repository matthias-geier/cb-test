var StoryList = React.createClass({displayName: "StoryList",
  getInitialState: function() {
    return {};
  },
  updateStory: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().
      match("^\/universe\/[^\/]+\/story\/([^\/]+)");
    if (match) {
      if (match[1] !== state.sid) {
        state.sid = match[1];
        this.setState(state);
      }
    } else {
      if ("sid" in state) {
        delete(state.sid);
        this.setState(state);
      }
    }
  },
  toggleNewHandler: function(e) {
    e.preventDefault();
    this.toggleNew();
  },
  toggleNew: function() {
    var state = this.state;
    if (state.create_new) {
      delete(state.create_new);
    } else {
      state.create_new = true;
    }
    this.setState(state);
  },
  closeStoryIf: function(sid) {
    if (sid && this.state.sid !== sid) {
      return;
    }
    window.history.pushState({}, this.props.uid,
      "/universe/" + this.props.uid);
    this.updateStory();
  },
  hrefHandler: function(e) {
    e.preventDefault();
    var sid = e.target.dataset.sid;
    var url = "/universe/" + this.props.uid + "/story";
    var state = this.state;
    if (sid) {
      url += "/" + sid;
      window.history.pushState({}, e.target.innerHTML, url);
      state.sid = sid;
    } else {
      window.history.pushState({}, "", url);
      delete(state.sid);
    }
    this.setState(state);
  },
  createNewHandler: function(e) {
    e.preventDefault();
    var title = this.refs.title.value;
    var url = "/universe/" + this.props.uid + "/story";
    promise.post("/api" + url,
      JSON.stringify({title: title}),
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 201) {
        window.history.pushState({}, payload.body.title,
          url + "/" + payload.body.sid);
        var state = this.state;
        state.stories.push(payload.body);
        this.setState(state);
        this.toggleNew();
        this.updateStory();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    this.toggleDestroy(e.currentTarget.dataset.sid);
  },
  toggleDestroy: function(sid) {
    var state = this.state;
    if (state.destroy && !sid) {
      delete(state.destroy);
    } else {
      state.destroy = sid;
    }
    this.setState(state);
  },
  destroyCallback: function(sid) {
    var url = "/universe/" + this.props.uid + "/story/" + sid;
    promise.del("/api" + url,
      undefined,
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      if (xhr.status === 204) {
        this.closeStoryIf(sid);
        var state = this.state;
        var i = 0;
        for(; state.stories[i].sid != sid; i++);
        state.stories.splice(i, 1);
        this.setState(state);
      } else {
        var payload = JSON.parse(text);
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  storySwapHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/swap";
    promise.put("/api" + url,
      JSON.stringify({num: e.currentTarget.dataset.num}),
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 200) {
        var state = this.state;
        state.stories.splice(0, state.stories.length);
        payload.body.forEach(function(elem) { state.stories.push(elem); });
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentWillMount: function() {
    var state = this.state;
    state.stories = this.props.stories;
    this.setState(state);
  },
  componentDidMount: function() {
    this.updateStory();
  },
  renderStoryList: function(storyTag) {
    return this.state.stories.map(function(elem, i) {
      var trash = this.props.opts.can("write") ?
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
          "data-sid": elem.sid, title: "Delete"}, 
          React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
        ) :
        "";
      return React.createElement("li", {key: elem+i}, 
        React.createElement("a", {href: "#", "data-sid": elem.sid, 
          onClick: this.hrefHandler}, elem.title), 
        this.props.opts.can("write") ?
          React.createElement("a", {href: "#", style: {marginLeft: "2em"}, title: "Move up", 
            onClick: this.storySwapHandler, "data-num": i}, 
            React.createElement("span", {className: "glyphicon glyphicon-chevron-up", 
              "aria-hidden": "true"})
          ) :
          "", 
        this.props.opts.can("write") ?
          React.createElement("a", {href: "#", style: {marginLeft: "2em"}, title: "Move down", 
            onClick: this.storySwapHandler, "data-num": i+1}, 
            React.createElement("span", {className: "glyphicon glyphicon-chevron-down", 
              "aria-hidden": "true"})
          ) :
          "", 
        this.state.destroy === elem.sid ?
          React.createElement(ConfirmBox, {payload: elem.sid, callback: this.destroyCallback, 
          close: this.toggleDestroy}, trash) : trash, 
        storyTag && this.state.sid == elem.sid ? storyTag : ""
      );
    }.bind(this));
  },
  renderNew: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.createNewHandler}, 
      React.createElement("input", {className: "form-control", ref: "title", 
        placeholder: "Title"}), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Create"})
    );
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateUniverse: this.props.opts.updateUniverse,
      updateStory: this.updateStory,
      can: this.props.opts.can
    };
    var storyTag = this.state.sid ?
      React.createElement(Story, {opts: opts, uid: this.props.uid, sid: this.state.sid, 
        key: this.state.story}) :
      undefined;
    return React.createElement("div", {style: {border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}, className: "row"}, 
      React.createElement("div", {className: "col-xs-12", style: {paddingLeft: "2em",
        paddingRight: "2em"}}, 
        React.createElement("h3", {style: {display: "inline-block"}}, 
          React.createElement("a", {href: "#", onClick: this.hrefHandler}, "Stories")
        ), 
        this.props.opts.can("write") ?
          React.createElement("form", {className: "form-inline", style: {display: "inline-block",
            verticalAlign: "middle", marginLeft: "2em"}}, 
            React.createElement("button", {type: "submit", className: "btn btn-default", 
              onClick: this.toggleNewHandler, title: "Create new story"}, 
              React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
            )
          ) :
          "", 
        this.state.create_new ? this.renderNew() : React.createElement("div", null), 

        React.createElement("ul", {className: "list-unstyled"}, this.renderStoryList(storyTag))
      )
    );
  }
});
