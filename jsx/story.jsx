var Stories = React.createClass({
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
      return <li key={elem+i}>
        <a href="#" data-sid={elem.sid}
          onClick={this.storyHrefHandler}>{elem.title}</a>
        <a href="#" style={{marginLeft: "2em"}}
          onClick={this.storySwapHandler} data-num={i}>
          <span className="glyphicon glyphicon-chevron-up"
            aria-hidden="true" />
        </a>
        <a href="#" style={{marginLeft: "2em"}}
          onClick={this.storySwapHandler} data-num={i+1}>
          <span className="glyphicon glyphicon-chevron-down"
            aria-hidden="true" />
        </a>
        <a href="#" style={{marginLeft: "2em"}} onClick={this.destroyHandler}
          data-sid={elem.sid}>
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a>
        {storyTag && this.state.sid == elem.sid ? storyTag : ""}
      </li>;
    }.bind(this));
  },
  renderNew: function() {
    return <form className="form-inline" onSubmit={this.createNewHandler}>
      <input className="form-control" ref="title"
        placeholder="Title" />
      <input type="submit" className="btn btn-default" value="Create" />
    </form>;
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
      <Story opts={opts} uid={this.props.uid} sid={this.state.sid}
        key={this.state.story} /> :
      undefined;
    return <div style={{border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}} className="col-xs-12 col-md-12">
      <h3 style={{display: "inline-block"}}>
        <a href="#" onClick={this.storyHrefHandler}>Stories</a>
      </h3>
      <form className="form-inline" style={
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}>
        <button type="submit" className="btn btn-default"
          onClick={this.toggleNewHandler}>
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
        </button>
      </form>
      {this.state.create_new ? this.renderNew() : <div />}

      <ul className="list-unstyled">{this.renderStoryList(storyTag)}</ul>
    </div>;
  }
});

var Story = React.createClass({
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
    return <form className="form-inline" onSubmit={this.updateHandler}>
      <input className="form-control" placeholder="Title" ref="title"
        defaultValue={this.state.story.title} />
      <input type="submit" className="btn btn-default" value="Update" />
    </form>;
  },
  renderPlain: function() {
    return this.state.story.poses.map(function(pose) {
      return <div className="col-md-12" key={pose[0]}>
        <blockquote>
          <p style={{whiteSpace: "pre-line"}}
            dangerouslySetInnerHTML={this.renderPose(pose[1])} />
          <footer>
            #{pose[0]}
            <a href="#" style={{marginLeft: "2em"}}
              onClick={this.poseSwapHandler} data-num={+(pose[0]) - 1}>
              <span className="glyphicon glyphicon-chevron-up"
                aria-hidden="true" />
            </a>
            <a href="#" style={{marginLeft: "2em"}}
              onClick={this.poseSwapHandler} data-num={pose[0]}>
              <span className="glyphicon glyphicon-chevron-down"
                aria-hidden="true" />
            </a>
            <a href="#" style={{marginLeft: "2em"}} onClick={this.unposeHandler}
              data-num={pose[0]}>
              <span className="glyphicon glyphicon-trash" aria-hidden="true" />
            </a>
          </footer>
        </blockquote>
      </div>;
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
        this.props.uid + "/character/$1\" " + "target=\"window\">$2</a>");
    return {__html: pose };
  },
  render: function() {
    if (!this.state.story) { return <div />; }

    var story = this.state.story;
    return <div className="col-xs-12 col-md-12">
      <h3>{story.title} <button type="submit" className="btn btn-default"
        onClick={this.toggleEdit}>
        <span className="glyphicon glyphicon-pencil" aria-hidden="true" />
      </button></h3>
      {this.state.editable ? this.renderEdit() : ""}
      {this.renderPlain()}
      <form onSubmit={this.poseHandler} className="row">
        <div className="form-group col-md-12">
          <textarea className="form-control" placeholder="Pose" ref="pose"
            rows="5" value={this.poseValue()}
            onChange={this.poseChangeHandler} />
        </div>
        <div className="col-md-3">
          <input type="submit" className="btn btn-primary form-control"
            value="Pose" />
        </div>
      </form>
    </div>;
  }
});
