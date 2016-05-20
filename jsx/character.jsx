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
        this.setState(payload.body);
      } else {
        this.props.opts.addError(payload.body);
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
        this.setState(payload.body);
        this.filterUnused(Object.keys(payload.body));
      } else {
        this.props.opts.addError(payload.body);
      }
    }.bind(this));
  },
  addFieldHandler: function(e) {
    e.preventDefault();
    var state = this.state;
    state["new field"] = "";
    this.setState(state);
  },
  componentDidMount: function() {
    this.update();
  },
  filterUnused: function(fieldset) {
    var unused = this.editableFields().filter(function(elem) {
      return !fieldset.includes(elem);
    });
    var state = this.state;
    unused.forEach(function(elem) { delete(state[elem]) });
    this.setState(state);
  },
  editableFields: function() {
    var blocked = ["id", "cid", "uid", "updated_at", "editable"];
    return Object.keys(this.state).filter(function(val) {
      return !blocked.includes(val);
    });
  },
  renderPlain: function() {
    return <table className="table table-hover"><tbody>{
      this.editableFields().map(function(key) {
        return <tr><td>{key}</td><td>{this.state[key]}</td></tr>;
      }.bind(this))
    }</tbody></table>;
  },
  renderEditable: function() {
    return <form className="form-inline" onSubmit={this.updateHandler}>
      <table className="table table-hover"><tbody>{
        this.editableFields().map(function(key, i) {
          return <tr key={key}>
            <td><input className="form-control" ref={"key"+i}
              defaultValue={key} /></td>
            <td><input className="form-control" ref={"value"+i}
              defaultValue={this.state[key]} /></td>
          </tr>;
        }.bind(this))
      }</tbody></table>
      <button type="submit" className="btn btn-default"
        onClick={this.addFieldHandler}>+</button>
      <input type="submit" className="btn btn-default" value="Save" />
    </form>;
  },
  render: function() {
    if (!this.state.id) { return <div />; }

    var char = this.state;
    return <div>
      <h3>{char.cid} <button type="submit" className="btn btn-default"
        onClick={this.toggleEdit}>edit</button></h3>
      {this.state.editable ? this.renderEditable() : this.renderPlain()}
    </div>;
  }
});

