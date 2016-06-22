var Characters = React.createClass({
  getInitialState: function() {
    return {};
  },
  updateCharacter: function() {
    var state = this.state;
    var match = this.props.opts.reqUrl().
      match("^\/universe\/[^\/]+\/character\/([^\/]+)");
    if (match) {
      if (match[1] !== state.character) {
        state.character = match[1];
        this.setState(state);
      }
    } else {
      if ("character" in state) {
        delete(state.character);
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
  closeCharacterIf: function(character) {
    if (character && this.state.character !== character) {
      return;
    }
    window.history.pushState({}, this.props.uid,
      "/universe/" + this.props.uid);
    this.updateCharacter();
  },
  charHrefHandler: function(e) {
    e.preventDefault();
    var char = e.target.dataset.character;
    var url = "/universe/" + this.props.uid + "/character";
    var state = this.state;
    if (char) {
      url += "/" + char;
      state.character = char;
    } else {
      delete(state.character);
    }
    window.history.pushState({}, char, url);
    this.setState(state);
  },
  createNewHandler: function(e) {
    e.preventDefault();
    var char = this.refs.id.value;
    var url = "/universe/" + this.props.uid + "/character";
    promise.post("/api" + url, JSON.stringify({cid: char}),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        window.history.pushState({}, char, url + "/" + char);
        var state = this.state;
        state.characters.push(char);
        this.setState(state);
        this.toggleNew();
        this.updateCharacter();
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  destroyHandler: function(e) {
    e.preventDefault();
    var char = e.currentTarget.dataset.character;
    var url = "/universe/" + this.props.uid + "/character/" + char;
    promise.del("/api" + url, undefined,
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.closeCharacterIf(char);
        var state = this.state;
        state.characters.splice(state.characters.indexOf(char), 1);
        this.setState(state);
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  componentWillMount: function() {
    var state = this.state;
    state.characters = this.props.characters;
    this.setState(state);
  },
  componentDidMount: function() {
    this.updateCharacter();
  },
  renderCharList: function() {
    return this.state.characters.map(function(elem, i) {
      return <li key={elem+i}>
        <a href="#" data-character={elem}
          onClick={this.charHrefHandler}>{elem}</a>
        <a href="#" style={{marginLeft: "2em"}} onClick={this.destroyHandler}
          data-character={elem}>
          <span className="glyphicon glyphicon-trash" aria-hidden="true" />
        </a>
      </li>;
    }.bind(this));
  },
  renderNew: function() {
    return <form className="form-inline" onSubmit={this.createNewHandler}>
      <input className="form-control" ref="id"
        placeholder="id (only a-z and _)" />
      <input type="submit" className="btn btn-default" value="Create" />
    </form>;
  },
  render: function() {
    var opts = {
      withState: this.props.opts.withState,
      addError: this.props.opts.addError,
      reqUrl: this.props.opts.reqUrl,
      updateCharacter: this.updateCharacter
    };
    return <div style={{border: "1px solid #ddd", borderTop: 0,
      backgroundColor: "white"}} className="col-xs-12 col-md-12">
      <h3 style={{display: "inline-block"}}>
        <a href="#" onClick={this.charHrefHandler}>Characters</a>
      </h3>
      <form className="form-inline" style={
        {display: "inline-block", verticalAlign: "middle", marginLeft: "2em"}}>
        <button type="submit" className="btn btn-default"
          onClick={this.toggleNewHandler}>
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
        </button>
      </form>
      { this.state.create_new ? this.renderNew() : <div /> }

      <ul className="list-unstyled">{this.renderCharList()}</ul>
      { this.state.character ?
        <Character opts={opts} uid={this.props.uid} id={this.state.character}
          key={this.state.character} /> :
        "" }
    </div>;
  }
});

var Character = React.createClass({
  getInitialState: function() {
    return {};
  },
  charUrl: function() {
    return "/universe/" + this.props.uid + "/character/" + this.props.id;
  },
  update: function() {
    promise.get("/api" + this.charUrl()).
      then(function(err, text, xhr) {
      var payload = JSON.parse(text);
      if (payload.status === 200) {
        var state = this.state;
        state.character = payload.body;
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
    promise.put("/api" + this.charUrl(), JSON.stringify(data),
      { "Content-Type": "application/json" }).then(function(err, text, xhr) {

      var payload = JSON.parse(text);
      if (payload.status === 200) {
        this.toggleEdit();
        var state = this.state;
        state.character = payload.body;
        this.setState(state);
        this.filterUnused(Object.keys(payload.body));
      } else {
        this.props.opts.addError(payload.body || payload.error);
      }
    }.bind(this));
  },
  addFieldHandler: function(e) {
    e.preventDefault();
    var state = this.state.character;
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
    unused.forEach(function(elem) { delete(state.character[elem]) });
    this.setState(state);
  },
  editableFields: function() {
    var blocked = ["id", "cid", "uid", "updated_at", "editable"];
    return Object.keys(this.state.character).filter(function(val) {
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
                this.renderText(this.state.character[key])} />
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
            <td style={{width: "25%"}}><input className="form-control" ref={"key"+i}
              defaultValue={key} /></td>
            <td><textarea className="form-control"
              ref={"value"+i} rows="3" style={{width: "70%"}}
              defaultValue={this.state.character[key]} /></td>
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
    if (!this.state.character) { return <div />; }

    var char = this.state.character;
    return <div className="col-xs-12 col-md-12">
      <h3 style={{display: "inline-block", textTransform: "uppercase"}}>{char.cid}</h3>
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

