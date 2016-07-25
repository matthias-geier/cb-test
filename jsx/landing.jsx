var Landing = React.createClass({
  getInitialState: function() {
    return {};
  },
  componentDidMount: function() {
  },
  render: function() {
    return <div className="col-xs-12 col-md-12"
      style={{backgroundColor: "#e5e5e5", minHeight: "50%",
      borderRadius: "5px"}}>

      <div className="row">
        <div className="col-xs-4 col-md-4">
          <h4>The what!</h4>
          <p>
            A platform to roleplay, write, create, dream and share your stories,
            adventures and fantasies. Collaborate with friends or likeminded
            people. Create your own universe!
          </p>
        </div>
        <div className="col-xs-4 col-md-4">
          <h4>The how!</h4>
          <p>
            Get started by:
            <ul>
              <li>Hit the huge <span className="glyphicon glyphicon-plus"
                aria-hidden="true" /> to create your own universe</li>
              <li>Select Stories</li>
              <li>Hit the <span className="glyphicon glyphicon-plus"
                aria-hidden="true" /> for adding a story</li>
              <li>Enter a title and then create it</li>
              <li>Start writing a story diary-style</li>
            </ul>
          </p>
        </div>
        <div className="col-xs-4 col-md-4">
          <h4>The collaboration!</h4>
          <p>
            And here's how to invite friends:
            <ul>
              <li>Hit the huge <span className="glyphicon glyphicon-lock"
                aria-hidden="true" /> on your universe</li>
              <li>Hit the <span className="glyphicon glyphicon-plus"
                aria-hidden="true" /> to generate a new Access Key</li>
              <li>Send your friend the URL behind the new key</li>
            </ul>
          </p>
        </div>
      </div>
    </div>;
  }
});
