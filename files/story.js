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
    promise.get("/api" + this.storyUrl()).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 200) {
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
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 200) {
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
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 201) {
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
  toggleUnposeHandler: function(e) {
    e.preventDefault();
    this.toggleUnpose(e.currentTarget.dataset.num);
  },
  toggleUnpose: function(num) {
    var state = this.state;
    if (state.unpose && !num) {
      delete(state.unpose);
    } else {
      state.unpose = num;
    }
    this.setState(state);
  },
  unposeCallback: function(num) {
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.sid;
    promise.del("/api" + url + "/pose",
      JSON.stringify({num: num}),
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      if (xhr.status === 204) {
        var state = this.state;
        state.story.poses.splice(num - 1, 1);
        state.story.poses = state.story.poses.map(function(pose, i) {
          pose[0] = i + 1;
          return pose;
        });
        this.setState(state);
      } else {
        var payload = JSON.parse(text);
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  poseSwapHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.story.sid;
    promise.put("/api" + url + "/pose/swap",
      JSON.stringify({num: e.currentTarget.dataset.num}),
      {"Content-Type": "application/json"}
    ).then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (xhr.status === 200) {
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
      var trash = this.props.opts.can("write") ?
        React.createElement("a", {href: "#", style: {marginLeft: "2em"}, title: "Delete", 
          onClick: this.toggleUnposeHandler, "data-num": pose[0]}, 
          React.createElement("span", {className: "glyphicon glyphicon-trash", "aria-hidden": "true"})
        ) :
        "";
      return React.createElement("div", {className: "col-xs-12", key: pose[0]}, 
        React.createElement("blockquote", null, 
          React.createElement("p", {style: {whiteSpace: "pre-line"}, 
            dangerouslySetInnerHTML: this.renderPose(pose[1])}), 
          React.createElement("footer", null, 
            "#", pose[0], 
            this.props.opts.can("write") ?
              React.createElement("a", {href: "#", style: {marginLeft: "2em"}, title: "Move up", 
                onClick: this.poseSwapHandler, "data-num": +(pose[0]) - 1}, 
                React.createElement("span", {className: "glyphicon glyphicon-chevron-up", 
                  "aria-hidden": "true"})
              ) :
              "", 
            this.props.opts.can("write") ?
              React.createElement("a", {href: "#", style: {marginLeft: "2em"}, title: "Move down", 
                onClick: this.poseSwapHandler, "data-num": pose[0]}, 
                React.createElement("span", {className: "glyphicon glyphicon-chevron-down", 
                  "aria-hidden": "true"})
              ) :
              "", 
            this.state.unpose === pose[0].toString() ?
              React.createElement(ConfirmBox, {payload: pose[0], callback: this.unposeCallback, 
              close: this.toggleUnpose}, trash) : trash
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
    return {__html: pose};
  },
  render: function() {
    if (!this.state.story) { return React.createElement("div", null); }

    var story = this.state.story;
    return React.createElement("div", {className: "row"}, 
      React.createElement("div", {className: "col-xs-12 col-md-12"}, 
        React.createElement("h3", null, story.title, " ", this.props.opts.can("write") ?
          React.createElement("button", {type: "submit", className: "btn btn-default", 
            onClick: this.toggleEdit}, 
            React.createElement("span", {className: "glyphicon glyphicon-edit", "aria-hidden": "true"})
          ) :
          ""), 
        this.state.editable ? this.renderEdit() : "", 
        this.renderPlain(), 
        this.props.opts.can("write") ?
          React.createElement("form", {onSubmit: this.poseHandler, className: "row"}, 
            React.createElement("div", {className: "form-group col-xs-12"}, 
              React.createElement("textarea", {className: "form-control", placeholder: "Pose", ref: "pose", 
                rows: "5", value: this.poseValue(), 
                onChange: this.poseChangeHandler})
            ), 
            React.createElement("div", {className: "col-xs-12 col-md-3"}, 
              React.createElement("input", {type: "submit", className: "btn btn-primary form-control", 
                value: "Pose"})
            )
          ) :
          ""
      )
    );
  }
});
