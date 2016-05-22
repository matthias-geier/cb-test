var Stories = React.createClass({
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
      return <li key={elem+i}>
        <a href={"/universe/" + this.props.id + "/story/" + elem.id}
          data-story={elem.id} onClick={this.storyHrefHandler}>{elem.title}</a>
        <a href="#" style={{marginLeft: "2em"}} onClick={this.destroyHandler}
          data-story={elem.id}>
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a>
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
    return <div>
      <h3 style={{display: "inline-block"}}>Stories</h3>
      <form className="form-inline" style={
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}>
        <button type="submit" className="btn btn-default"
          onClick={this.toggleNewHandler}>
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
        </button>
      </form>
      { this.state.create_new ? this.renderNew() : <div /> }

      <ul className="list-unstyled">{this.renderStoryList()}</ul>
      { this.state.story ?
        <Story opts={opts} uid={this.props.uid} id={this.state.story}
          key={this.state.story} /> :
        "" }
    </div>;
  }
});

var Story = React.createClass({
  getInitialState: function() {
    return {};
  },
  storyUrl: function() {
    return "/universe/" + this.props.uid + "/story/" + this.props.id;
  },
  update: function() {
    promise.get("/api" + this.storyUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
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
    var url = "/universe/" + this.props.uid + "/story/" + this.state.id;
    promise.put("/api" + url,
      JSON.stringify({title: this.refs.title.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.props.opts.updateUniverse();
        this.toggleEdit();
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  poseHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.id;
    promise.post("/api" + url + "/pose",
      JSON.stringify({pose: this.refs.pose.value}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
        this.refs.pose.value = "";
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  unposeHandler: function(e) {
    e.preventDefault();
    var url = "/universe/" + this.props.uid + "/story/" + this.state.id;
    promise.del("/api" + url + "/pose",
      JSON.stringify({timestamp: e.currentTarget.dataset.ts}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.setState(payload.body);
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
        defaultValue={this.state.title} />
      <input type="submit" className="btn btn-default" value="Update" />
    </form>;
  },
  renderPlain: function() {
    return this.state.poses.map(function(pose, i) {
      return <div className="row" key={i}>
        <div className="col-md-3">{
          new Date(pose[0] * 1000).format('M jS Y H:i')
        }
        <a href="#" style={{marginLeft: "2em"}} onClick={this.unposeHandler}
          data-ts={pose[0]}>
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a>
        </div>
        <div className="col-md-9"><pre>{pose[1]}</pre></div>
      </div>;
    }.bind(this));
  },
  render: function() {
    if (!this.state.id) { return <div />; }

    var story = this.state;
    return <div>
      <h3>{story.title} <button type="submit" className="btn btn-default"
        onClick={this.toggleEdit}>
        <span className="glyphicon glyphicon-pencil" aria-hidden="true" />
      </button></h3>
      {this.state.editable ? this.renderEdit() : ""}
      {this.renderPlain()}
      <form className="form-inline" onSubmit={this.poseHandler}>
        <textarea className="form-control" placeholder="Pose" ref="pose" />
        <input type="submit" className="btn btn-default" value="Pose" />
      </form>
    </div>;
  }
});
