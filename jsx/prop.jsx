var Props = React.createClass({
  getInitialState: function() {
    return {};
  },
  updateProp: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().
      match("^\/universe\/[^\/]+\/prop\/([^\/]+)");
    if (match) {
      if (match[1] !== state.pid) {
        state.pid = match[1];
        this.setState(state);
      }
    } else {
      if ("pid" in state) {
        delete(state.pid);
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
  closePropIf: function(pid) {
    if (pid && this.state.pid !== pid) {
      return;
    }
    window.history.pushState({}, this.props.uid,
      "/universe/" + this.props.uid);
    this.updateProp();
  },
  propHrefHandler: function(e) {
    e.preventDefault();
    var pid = e.target.dataset.pid;
    var url = "/universe/" + this.props.uid + "/prop";
    var state = this.state;
    if (pid) {
      url += "/" + pid;
      state.pid = pid;
    } else {
      delete(state.pid);
    }
    window.history.pushState({}, pid, url);
    this.setState(state);
  },
  createNewHandler: function(e) {
    e.preventDefault();
    var pid = this.refs.pid.value;
    var url = "/universe/" + this.props.uid + "/prop";
    promise.post("/api" + url, JSON.stringify({pid: pid}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, pid, url + "/" + pid);
        var state = this.state;
        state.props.push(pid);
        state.props.sort();
        this.setState(state);
        this.toggleNew();
        this.updateProp();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    this.toggleDestroy(e.currentTarget.dataset.pid);
  },
  toggleDestroy: function(pid) {
    var state = this.state;
    if (state.destroy && !pid) {
      delete(state.destroy);
    } else {
      state.destroy = pid;
    }
    this.setState(state);
  },
  destroyCallback: function(pid) {
    var url = "/universe/" + this.props.uid + "/prop/" + pid;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closePropIf(pid);
        var state = this.state;
        state.props.splice(state.props.indexOf(pid), 1);
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentWillMount: function() {
    var state = this.state;
    state.props = this.props.props;
    this.setState(state);
  },
  componentDidMount: function() {
    this.updateProp();
  },
  renderPropList: function(propTag) {
    return this.state.props.map(function(elem, i) {
      var trash =
        <a href="#" style={{marginLeft: "2em"}} onClick={this.destroyHandler}
          data-pid={elem}>
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a>;
      return <li key={elem+i}>
        <a href="#" data-pid={elem}
          onClick={this.propHrefHandler}>{elem}</a>
        {this.state.destroy === elem ?
          <ConfirmBox payload={elem} callback={this.destroyCallback}
          close={this.toggleDestroy}>{trash}</ConfirmBox> : trash}
        {propTag && elem == this.state.pid ? propTag : ""}
      </li>;
    }.bind(this));
  },
  renderNew: function() {
    return <form className="form-inline" onSubmit={this.createNewHandler}>
      <input className="form-control" ref="pid" maxlength="24"
        placeholder="id (only a-z and _)" />
      <input type="submit" className="btn btn-default" value="Create" />
    </form>;
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateProp: this.updateProp
    };
    var propTag = this.state.pid ?
      <Prop opts={opts} uid={this.props.uid} pid={this.state.pid}
        key={this.state.pid} /> :
      undefined;
    return <div style={{border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}} className="col-xs-12 col-md-12">
      <h3 style={{display: "inline-block"}}>
        <a href="#" onClick={this.propHrefHandler}>Props</a>
      </h3>
      <form className="form-inline" style={
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}>
        <button type="submit" className="btn btn-default"
          onClick={this.toggleNewHandler}>
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
        </button>
      </form>
      {this.state.create_new ? this.renderNew() : <div />}

      <ul className="list-unstyled">{this.renderPropList(propTag)}</ul>
    </div>;
  }
});

var Prop = React.createClass({
  getInitialState: function() {
    return {};
  },
  propUrl: function() {
    return "/universe/" + this.props.uid + "/prop/" + this.props.pid;
  },
  update: function() {
    promise.get("/api" + this.propUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.prop = payload.body;
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
    var data = {};
    for(var i = 0; ; i++) {
      if (!this.refs["key"+i]) { break; }
      data[this.refs["key"+i].value] = this.refs["value"+i].value;
    }
    promise.put("/api" + this.propUrl(), JSON.stringify(data),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        var state = this.state;
        state.prop = payload.body;
        this.setState(state);
        this.filterUnused(Object.keys(payload.body));
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  addFieldHandler: function(e) {
    e.preventDefault();
    var state = this.state.prop;
    for(var i = 1; ; i++) {
      if (Object.keys(state).indexOf("new field " + i) > -1) { continue; }
      state["new field " + i] = "";
      break;
    }
    this.setState(state);
  },
  componentDidMount: function() {
    this.update();
  },
  filterUnused: function(fieldset) {
    var unused = this.editableFields().filter(function(elem) {
      return fieldset.indexOf(elem) === -1;
    });
    var state = this.state;
    unused.forEach(function(elem) { delete(state.prop[elem]) });
    this.setState(state);
  },
  editableFields: function() {
    var blocked = ["pid", "uid", "updated_at", "editable"];
    return Object.keys(this.state.prop).filter(function(val) {
      return blocked.indexOf(val) === -1;
    });
  },
  renderPlain: function() {
    var pairs = [];
    this.editableFields().forEach(function(key, i) {
      if (i%2 === 0) {
        pairs.push([key]);
      } else {
        pairs[pairs.length - 1].push(key);
      }
    });
    return pairs.map(function(key_pair) {
      return <div className="row" key={key_pair}>{
        key_pair.map(function(key, i) {
          return <div className="col-xs-6 col-md-6" key={key}>
            <blockquote className={i%2 === 1 ? "blockquote-reverse" : ""}>
              <p style={{whiteSpace: "pre-line"}} dangerouslySetInnerHTML={
                this.renderText(this.state.prop[key])} />
              <footer style={{fontVariant: "small-caps"}}>{key}</footer>
            </blockquote>
          </div>;
        }.bind(this))
      }</div>;
    }.bind(this));
  },
  renderText: function(text) {
    text = String(text).
      replace(/&/g, "&amp;").
      replace(/</g, "&lt;").
      replace(/>/g, "&gt;").
      replace(/"/g, "&quot;").
      replace(/'/g, "&#039;").
      replace(/\//g, "&#x2F;");
    return {__html: text };
  },
  renderEditable: function() {
    return <form className="form-inline" onSubmit={this.updateHandler}>
      <table className="table table-hover"><tbody>{
        this.editableFields().map(function(key, i) {
          return <tr key={key}>
            <td style={{width: "25%"}}><input className="form-control"
              ref={"key"+i} defaultValue={key} /></td>
            <td><textarea className="form-control"
              ref={"value"+i} rows="3" style={{width: "70%"}}
              defaultValue={this.state.prop[key]} /></td>
          </tr>;
        }.bind(this))
      }</tbody></table>
      <button type="submit" className="btn btn-default"
        onClick={this.addFieldHandler}>
        <span className="glyphicon glyphicon-plus" aria-hidden="true" />
      </button>
      <input type="submit" className="btn btn-default input-sm" value="Save" />
    </form>;
  },
  render: function() {
    if (!this.state.prop) { return <div />; }

    var prop = this.state.prop;
    return <div className="col-xs-12 col-md-12">
      <h3 style={{display: "inline-block", textTransform: "uppercase"}}>
        {prop.pid}
      </h3>
      <form className="form-inline" style={
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}>
        <button type="submit" className="btn btn-default"
          onClick={this.toggleEditHandler}>
          <span className="glyphicon glyphicon-pencil" aria-hidden="true" />
        </button>
      </form>
      {this.state.editable ? this.renderEditable() : this.renderPlain()}
    </div>;
  }
});

