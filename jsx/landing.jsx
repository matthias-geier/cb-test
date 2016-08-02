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

      <div className="jumbotron">
        <h2>The what!</h2>
        <p>
          A platform to roleplay, write, create, dream and share your stories,
          adventures and fantasies. Collaborate with friends or likeminded
          people. Create your own universe!
        </p>
      </div>
      <div className="row">
        <div className="col-xs-6 col-md-6">
          <div className="jumbotron">
            <h2>The how!</h2>
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
        </div>
        <div className="col-xs-6 col-md-6">
          <div className="jumbotron">
            <h2>The collaboration!</h2>
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
        </div>
      </div>
      <div className="row"><div className="col-xs-12 col-md-12">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3>FAQ</h3>
          </div>
          <div className="panel-heading" onClick={this.collapse}>
            <h4><a href="#collapse">What is a prop?</a></h4>
          </div>
          <div className="panel-body" style={{display: "none"}}>
            <p>It is an way to represent various kinds of elements in your
            universe. By just needing a name, it can be a character,
            an animal, an object, anything really that needs properties.</p>

            <p>Imagine your main character John J. Doe who is 29 years old
            and has brown hair. This is a way to bring him into the
            universe.</p>
          </div>

          <div className="panel-heading" onClick={this.collapse}>
            <h4><a href="#collapse">How can a prop be used?</a></h4>
          </div>
          <div className="panel-body" style={{display: "none"}}>
            <p>It only makes sense to define a prop, when it can be used inside
            a story. At the moment you link the prop name in the story
            and hide the link behind a description.</p>

            <p>Take your main character John J. Doe, who has the prop name
            <i>john_j_doe</i>. Reference him in any story by adding
            [john_j_doe|John Doe] and he will appear as a link.</p>

            <p>The second option, the name for the link is a choice made
            for universes that evolve. Maybe in your progress, John will
            receive a crown, or knighthood. Suddenly in the next story
            he is King John, but changing the link name everywhere would
            be spoiling it.</p>
          </div>

          <div className="panel-heading" onClick={this.collapse}>
            <h4><a href="#collapse">What is an access key?</a></h4>
          </div>
          <div className="panel-body" style={{display: "none"}}>
            <p>It is the username equivalent. If you play with a bunch of
            people, try to create as many access keys as you have players.</p>
          </div>

          <div className="panel-heading" onClick={this.collapse}>
            <h4><a href="#collapse">Are there different access rights?</a></h4>
          </div>
          <div className="panel-body" style={{display: "none"}}>
            <p>Right, the admin and no admin setup. It is planned to add
            a role each access key, but right now everyone is the
            superadmin. Make backups often if you do not trust your players!</p>
          </div>

          <div className="panel-heading" onClick={this.collapse}>
            <h4><a href="#collapse">What if someone deletes my
              universe?</a></h4>
          </div>
          <div className="panel-body" style={{display: "none"}}>
            <p>This is on the to-do list. Right now the old saying from
            the BOFH applies - you better have a backup.</p>

            <p>You can backup <span className="glyphicon glyphicon-download"
            aria-hidden="true" /> and <span
            className="glyphicon glyphicon-upload" aria-hidden="true" /> restore
            your universe with a simple button click. Just remember,
            it will wipe the universe you apply the backup to.</p>
          </div>
        </div></div>
      </div>
    </div>;
  }
});
