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
    return <div className="row">{
      this.editableFields().map(function(field, i) {
        return <div className="col-xs-12 col-md-3" key={field}>
          <blockquote className={i%2 === 1 ? "blockquote-reverse" : ""}>
            <p style={{whiteSpace: "pre-line"}} dangerouslySetInnerHTML={
              this.renderText(this.state.prop[field])} />
            <footer style={{fontVariant: "small-caps"}}>{field}</footer>
          </blockquote>
        </div>;
      }.bind(this))
    }</div>;
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
    return <div className="row">
      <div className="col-xs-12">
      <h3 style={{display: "inline-block", textTransform: "uppercase"}}>
        {prop.pid}
      </h3>
      {this.props.opts.can("write") ?
        <form className="form-inline" style={{display: "inline-block",
          verticalAlign: "middle", marginLeft: "2em"}}>
          <button type="submit" className="btn btn-default"
            onClick={this.toggleEditHandler} title="Edit">
            <span className="glyphicon glyphicon-edit" aria-hidden="true" />
          </button>
        </form> :
        ""}
      {this.state.editable ? this.renderEditable() : this.renderPlain()}
      </div>
    </div>;
  }
});

