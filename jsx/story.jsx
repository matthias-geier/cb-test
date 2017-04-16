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
    return <form className="form-inline" onSubmit={this.updateHandler}>
      <input className="form-control" placeholder="Title" ref="title"
        defaultValue={this.state.story.title} />
      <input type="submit" className="btn btn-default" value="Update" />
    </form>;
  },
  renderPlain: function() {
    return this.state.story.poses.map(function(pose) {
      var trash = this.props.opts.can("write") ?
        <a href="#" style={{marginLeft: "2em"}} title="Delete"
          onClick={this.toggleUnposeHandler} data-num={pose[0]}>
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a> :
        "";
      return <div className="col-xs-12" key={pose[0]}>
        <blockquote>
          <p style={{whiteSpace: "pre-line"}}
            dangerouslySetInnerHTML={this.renderPose(pose[1])} />
          <footer>
            #{pose[0]}
            {this.props.opts.can("write") ?
              <a href="#" style={{marginLeft: "2em"}} title="Move up"
                onClick={this.poseSwapHandler} data-num={+(pose[0]) - 1}>
                <span className="glyphicon glyphicon-chevron-up"
                  aria-hidden="true" />
              </a> :
              ""}
            {this.props.opts.can("write") ?
              <a href="#" style={{marginLeft: "2em"}} title="Move down"
                onClick={this.poseSwapHandler} data-num={pose[0]}>
                <span className="glyphicon glyphicon-chevron-down"
                  aria-hidden="true" />
              </a> :
              ""}
            {this.state.unpose === pose[0].toString() ?
              <ConfirmBox payload={pose[0]} callback={this.unposeCallback}
              close={this.toggleUnpose}>{trash}</ConfirmBox> : trash}
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
        this.props.uid + "/prop/$1\" " + "target=\"window\">$2</a>");
    return {__html: pose};
  },
  render: function() {
    if (!this.state.story) { return <div />; }

    var story = this.state.story;
    return <div className="row">
      <div className="col-xs-12 col-md-12">
        <h3>{story.title} {this.props.opts.can("write") ?
          <button type="submit" className="btn btn-default"
            onClick={this.toggleEdit}>
            <span className="glyphicon glyphicon-edit" aria-hidden="true" />
          </button> :
          ""}</h3>
        {this.state.editable ? this.renderEdit() : ""}
        {this.renderPlain()}
        {this.props.opts.can("write") ?
          <form onSubmit={this.poseHandler} className="row">
            <div className="form-group col-xs-12">
              <textarea className="form-control" placeholder="Pose" ref="pose"
                rows="5" value={this.poseValue()}
                onChange={this.poseChangeHandler} />
            </div>
            <div className="col-xs-12 col-md-3">
              <input type="submit" className="btn btn-primary form-control"
                value="Pose" />
            </div>
          </form> :
          ""}
      </div>
    </div>;
  }
});
