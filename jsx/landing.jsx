var Landing = React.createClass({
  getInitialState: function() {
    return {};
  },
  collapse: function(e) {
    e.preventDefault();
    var h4 = e.currentTarget;
    var h4_i = [].indexOf.call(h4.parentNode.children, h4);
    var container = h4.parentNode.children[h4_i + 1];
    if (container.style.display === "none") {
      container.style.display = null;
    } else {
      container.style.display = "none";
    }
  },
  componentDidMount: function() {
  },
  render: function() {
    return <div className="col-xs-12 col-md-12"
      style={{backgroundColor: "#e5e5e5", minHeight: "50%",
      borderRadius: "5px", paddingTop: "1em"}}>

      <div className="col-xs-4 col-md-4" style={{border: "1px solid #ddd",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "5px"}}>
        <h4>The what!</h4>
        <p>
          A platform to roleplay, write, create, dream and share your stories,
          adventures and fantasies. Collaborate with friends or likeminded
          people. Create your own universe!
        </p>
      </div>
      <div className="col-xs-4 col-md-4" style={{border: "1px solid #ddd",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "5px"}}>
        <h4>The how!</h4>
        <p>
          Get started by:
        </p>
        <ul>
          <li>Hit the huge <span className="glyphicon glyphicon-plus"
            aria-hidden="true" /> to create your own universe</li>
          <li>Select Stories</li>
          <li>Hit the <span className="glyphicon glyphicon-plus"
            aria-hidden="true" /> for adding a story</li>
          <li>Enter a title and then create it</li>
          <li>Start writing a story diary-style</li>
        </ul>
      </div>
      <div className="col-xs-4 col-md-4" style={{border: "1px solid #ddd",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "5px"}}>
        <h4>The collaboration!</h4>
        <p>
          And here's how to invite friends:
        </p>
        <ul>
          <li>Hit the huge <span className="glyphicon glyphicon-lock"
            aria-hidden="true" /> on your universe</li>
          <li>Hit the <span className="glyphicon glyphicon-plus"
            aria-hidden="true" /> to generate a new Access Key</li>
          <li>Send your friend the URL behind the new key</li>
        </ul>
      </div>
      <div className="col-xs-12 col-md-12 panel-group" id="accordion">
        <h3>FAQ</h3>
        <h4 onClick={this.collapse}>
          <a href="#collapse">What is a prop?</a>
        </h4>
        <div className="well" style={{display: "none"}}>Yays</div>
      </div>
    </div>;
  }
});
