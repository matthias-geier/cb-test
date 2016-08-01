var Stories = React.createClass({displayName: "Stories",
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
  storyHrefHandler: function(e) {
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
    promise.post("/api" + url, JSON.stringify({title: title}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
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
    var sid = e.currentTarget.dataset.sid;
    var url = "/universe/" + this.props.uid + "/story/" + sid;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closeStoryIf(sid);
        var state = this.state;
        var i = 0;
        for(; state.stories[i].sid != sid; i++);
        state.stories.splice(i, 1);
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  storySwapHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/swap";
    promise.put("/api" + url,
      JSON.stringify({num: e.currentTarget.dataset.num}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
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
      return React.createElement("li", {key: elem+i}, 
        React.createElement("a", {href: "#", "data-sid": elem.sid, 
          onClick: this.storyHrefHandler}, elem.title), 
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, 
          onClick: this.storySwapHandler, "data-num": i}, 
          React.createElement("span", {className: "glyphicon glyphicon-chevron-up", 
            "aria-hidden": "true"})
        ), 
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, 
          onClick: this.storySwapHandler, "data-num": i+1}, 
          React.createElement("span", {className: "glyphicon glyphicon-chevron-down", 
            "aria-hidden": "true"})
        ), 
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
          "data-sid": elem.sid}, 
          React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
        ), 
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
      updateStory: this.updateStory
    };
    var storyTag = this.state.sid ?
      React.createElement(Story, {opts: opts, uid: this.props.uid, sid: this.state.sid, 
        key: this.state.story}) :
      undefined;
    return React.createElement("div", {style: {border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}, className: "col-xs-12 col-md-12"}, 
      React.createElement("h3", {style: {display: "inline-block"}}, 
        React.createElement("a", {href: "#", onClick: this.storyHrefHandler}, "Stories")
      ), 
      React.createElement("form", {className: "form-inline", style: 
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.toggleNewHandler}, 
          React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
        )
      ), 
      this.state.create_new ? this.renderNew() : React.createElement("div", null), 

      React.createElement("ul", {className: "list-unstyled"}, this.renderStoryList(storyTag))
    );
  }
});

var Story = React.createClass({displayName: "Story",
  getInitialState: function() {
    return {};
  },
  storyUrl: function() {
    return "/universe/" + this.props.uid + "/story/" + this.props.sid;
  },
  poseValue: function() {
    var state = this.state;
    var pose_count = state.story.poses.length;
    if (pose_count === 0) { return ""; }
    var has_preview = state.story.poses[pose_count - 1][0] === "new";
    return (has_preview) ? state.story.poses[pose_count - 1][1] : "";
  },
  update: function() {
    promise.get("/api" + this.storyUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.story = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  toggleEditHandler: function(e) {
    e.preventDefault();
    this.toggleEdit();
  },
  toggleEdit: function() {
    var state = this.state;
    if (state.editable) {
      delete(state.editable);
    } else {
      state.editable = true;
    }
    this.setState(state);
  },
  updateHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.sid;
    promise.put("/api" + url,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        var state = this.state;
        state.story = payload.body;
        this.setState(state);
        this.props.opts.updateUniverse();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  poseHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.sid;
    promise.post("/api" + url + "/pose",
      JSON.stringify({pose: this.refs.pose.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.story = payload.body;
        this.setState(state);
        this.refs.pose.value = "";
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  poseChangeHandler: function(e) {
    e.preventDefault();
    var pose = this.refs.pose.value;
    var state = this.state;
    var pose_count = state.story.poses.length;
    var has_preview = pose_count > 0 &&
      state.story.poses[pose_count - 1][0] === "new";
    if (!pose || pose.length === 0) {
      if (has_preview) {
        state.story.poses.splice(pose_count - 1, 1);
      }
    } else {
      if (!has_preview) {
        state.story.poses.splice(pose_count, 0, ["new", ""]);
        pose_count++;
      }
      state.story.poses[pose_count - 1][1] = pose;
    }
    this.setState(state);
  },
  unposeHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.sid;
    promise.del("/api" + url + "/pose",
      JSON.stringify({num: e.currentTarget.dataset.num}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.story = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  poseSwapHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.sid;
    promise.put("/api" + url + "/pose/swap",
      JSON.stringify({num: e.currentTarget.dataset.num}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.story = payload.body;
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentDidMount: function() {
    this.update();
  },
  renderEdit: function() {
    return React.createElement("form", {className: "form-inline", onSubmit: this.updateHandler}, 
      React.createElement("input", {className: "form-control", placeholder: "Title", ref: "title", 
        defaultValue: this.state.story.title}), 
      React.createElement("input", {type: "submit", className: "btn btn-default", value: "Update"})
    );
  },
  renderPlain: function() {
    return this.state.story.poses.map(function(pose) {
      return React.createElement("div", {className: "col-md-12", key: pose[0]}, 
        React.createElement("blockquote", null, 
          React.createElement("p", {style: {whiteSpace: "pre-line"}, 
            dangerouslySetInnerHTML: this.renderPose(pose[1])}), 
          React.createElement("footer", null, 
            "#", pose[0], 
            React.createElement("a", {href: "#", style: {marginLeft: "2em"}, 
              onClick: this.poseSwapHandler, "data-num": +(pose[0]) - 1}, 
              React.createElement("span", {className: "glyphicon glyphicon-chevron-up", 
                "aria-hidden": "true"})
            ), 
            React.createElement("a", {href: "#", style: {marginLeft: "2em"}, 
              onClick: this.poseSwapHandler, "data-num": pose[0]}, 
              React.createElement("span", {className: "glyphicon glyphicon-chevron-down", 
                "aria-hidden": "true"})
            ), 
            React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.unposeHandler, 
              "data-num": pose[0]}, 
              React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
            )
          )
        )
      );
    }.bind(this));
  },
  renderPose: function(pose) {
    pose = String(pose).
      replace(/&/g, "&amp;").
      replace(/</g, "&lt;").
      replace(/>/g, "&gt;").
      replace(/"/g, "&quot;").
      replace(/'/g, "&#039;").
      replace(/\//g, "&#x2F;").
      replace(/\[([^|]+)\|([^\]]+)\]/g, "<a href=\"/universe/" +
        this.props.uid + "/prop/$1\" " + "target=\"window\">$2</a>");
    return {__html: pose };
  },
  render: function() {
    if (!this.state.story) { return React.createElement("div", null); }

    var story = this.state.story;
    return React.createElement("div", {className: "col-xs-12 col-md-12"}, 
      React.createElement("h3", null, story.title, " ", React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.toggleEdit}, 
        React.createElement("span", {className: "glyphicon glyphicon-pencil", "aria-hidden": "true"})
      )), 
      this.state.editable ? this.renderEdit() : "", 
      this.renderPlain(), 
      React.createElement("form", {onSubmit: this.poseHandler, className: "row"}, 
        React.createElement("div", {className: "form-group col-md-12"}, 
          React.createElement("textarea", {className: "form-control", placeholder: "Pose", ref: "pose", 
            rows: "5", value: this.poseValue(), 
            onChange: this.poseChangeHandler})
        ), 
        React.createElement("div", {className: "col-md-3"}, 
          React.createElement("input", {type: "submit", className: "btn btn-primary form-control", 
            value: "Pose"})
        )
      )
    );
  }
});
