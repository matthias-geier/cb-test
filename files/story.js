var Stories = React.createClass({displayName: "Stories",
  getInitialState: function() {
    return {};
  },
  updateStory: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().
      match("^\/universe\/[^\/]+\/story\/([^\/]+)");
    if (match) {
      if (match[1] !== state.story) {
        state.story = match[1];
        this.setState(state);
      }
    } else {
      if ("story" in state) {
        delete(state.story);
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
  closeStoryIf: function(story) {
    if (story && this.state.story !== story) {
      return;
    }
    window.history.pushState({}, this.props.uid,
      "/universe/" + this.props.uid);
    this.updateStory();
  },
  storyHrefHandler: function(e) {
    e.preventDefault();
    var story = e.target.dataset.story;
    var url = "/universe/" + this.props.uid + "/story/" + story;
    window.history.pushState({}, e.target.innerHTML, url);
    var state = this.state;
    state.story = story;
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
          url + "/" + payload.body.id);
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
    var story = e.currentTarget.dataset.story;
    var url = "/universe/" + this.props.uid + "/story/" + story;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closeStoryIf(story);
        var state = this.state;
        state.stories.splice(state.stories.indexOf(story), 1);
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
  renderStoryList: function() {
    return this.state.stories.map(function(elem, i) {
      return React.createElement("li", {key: elem+i}, 
        React.createElement("a", {href: "/universe/" + this.props.id + "/story/" + elem.id, 
          "data-story": elem.id, onClick: this.storyHrefHandler}, elem.title), 
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.destroyHandler, 
          "data-story": elem.id}, 
          React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
        )
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
    return React.createElement("div", {style: {border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white", padding: "0.5em"}}, 
      React.createElement("h3", {style: {display: "inline-block"}}, "Stories"), 
      React.createElement("form", {className: "form-inline", style: 
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}, 
        React.createElement("button", {type: "submit", className: "btn btn-default", 
          onClick: this.toggleNewHandler}, 
          React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
        )
      ), 
       this.state.create_new ? this.renderNew() : React.createElement("div", null), 

      React.createElement("ul", {className: "list-unstyled"}, this.renderStoryList()), 
       this.state.story ?
        React.createElement(Story, {opts: opts, uid: this.props.uid, id: this.state.story, 
          key: this.state.story}) :
        ""
    );
  }
});

var Story = React.createClass({displayName: "Story",
  getInitialState: function() {
    return {};
  },
  storyUrl: function() {
    return "/universe/" + this.props.uid + "/story/" + this.props.id;
  },
  poseValue: function() {
    var state = this.state;
    if (state.story.poses.length === 0) { return ""; }
    var has_preview = state.story.poses[state.story.poses.length - 1][0] === "";
    return (has_preview) ? state.story.poses[state.story.poses.length - 1][1] :
      "";
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
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.id;
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
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.id;
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
      state.story.poses[pose_count - 1][0] === "";
    if (!pose || pose.length === 0) {
      if (has_preview) {
        state.story.poses.splice(pose_count - 1, 1);
      }
    } else {
      if (!has_preview) {
        state.story.poses.splice(pose_count === 0 ? 0 : pose_count -1, 0,
          ["", ""]);
        pose_count++;
      }
      state.story.poses[pose_count - 1][1] = pose;
    }
    this.setState(state);
  },
  unposeHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.id;
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
          React.createElement("p", {style: {whiteSpace: "pre-line"}, dangerouslySetInnerHTML: this.renderPose(pose[1])}), 
          React.createElement("footer", null, "#", pose[0], 
          React.createElement("a", {href: "#", style: {marginLeft: "2em"}, onClick: this.unposeHandler, 
            "data-num": pose[0]}, 
            React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
          ))
        )
      );
    }.bind(this));
  },
  renderPose: function(pose) {
    return {__html: pose.replace(/\[([^|]+)\|([^\]]+)\]/g,
      "<a href=\"/universe/" + this.props.uid + "/character/$1\" " +
      "target=\"window\">$2</a>") };
  },
  render: function() {
    if (!this.state.story) { return React.createElement("div", null); }

    var story = this.state.story;
    return React.createElement("div", null, 
      React.createElement("h3", null, story.title, " ", React.createElement("button", {type: "submit", className: "btn btn-default", 
        onClick: this.toggleEdit}, 
        React.createElement("span", {className: "glyphicon glyphicon-pencil", "aria-hidden": "true"})
      )), 
      this.state.editable ? this.renderEdit() : "", 
      this.renderPlain(), 
      React.createElement("div", {className: "row"}, 
      React.createElement("form", {onSubmit: this.poseHandler}, 
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
      )
    );
  }
});
