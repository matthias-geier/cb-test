var Landing = React.createClass({displayName: "Landing",
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
    return React.createElement("div", {className: "col-xs-12 col-md-12", 
      style: {backgroundColor: "#e5e5e5", minHeight: "50%",
      borderRadius: "5px", paddingTop: "1em"}}, 

      React.createElement("div", {className: "jumbotron"}, 
        React.createElement("h2", null, "The what!"), 
        React.createElement("p", null, 
          "A platform to roleplay, write, create, dream and share your stories," + ' ' +
          "adventures and fantasies. Collaborate with friends or likeminded" + ' ' +
          "people. Create your own universe!"
        )
      ), 
      React.createElement("div", {className: "row"}, 
        React.createElement("div", {className: "col-xs-6 col-md-6"}, 
          React.createElement("div", {className: "jumbotron"}, 
            React.createElement("h2", null, "The how!"), 
            React.createElement("p", null, 
              "Get started by:"
            ), 
            React.createElement("ul", null, 
              React.createElement("li", null, "Hit the huge ", React.createElement("span", {className: "glyphicon glyphicon-plus", 
                "aria-hidden": "true"}), " to create your own universe"), 
              React.createElement("li", null, "Select Stories"), 
              React.createElement("li", null, "Hit the ", React.createElement("span", {className: "glyphicon glyphicon-plus", 
                "aria-hidden": "true"}), " for adding a story"), 
              React.createElement("li", null, "Enter a title and then create it"), 
              React.createElement("li", null, "Start writing a story diary-style")
            )
          )
        ), 
        React.createElement("div", {className: "col-xs-6 col-md-6"}, 
          React.createElement("div", {className: "jumbotron"}, 
            React.createElement("h2", null, "The collaboration!"), 
            React.createElement("p", null, 
              "And here's how to invite friends:"
            ), 
            React.createElement("ul", null, 
              React.createElement("li", null, "Hit the huge ", React.createElement("span", {className: "glyphicon glyphicon-lock", 
                "aria-hidden": "true"}), " on your universe"), 
              React.createElement("li", null, "Hit the ", React.createElement("span", {className: "glyphicon glyphicon-plus", 
                "aria-hidden": "true"}), " to generate a new Access Key"), 
              React.createElement("li", null, "Send your friend the URL behind the new key")
            )
          )
        )
      ), 
      React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-xs-12 col-md-12"}, 
        React.createElement("div", {className: "panel panel-default"}, 
          React.createElement("div", {className: "panel-heading"}, 
            React.createElement("h3", null, "FAQ")
          ), 
          React.createElement("div", {className: "panel-heading", onClick: this.collapse}, 
            React.createElement("h4", null, React.createElement("a", {href: "#collapse"}, "What is a prop?"))
          ), 
          React.createElement("div", {className: "panel-body", style: {display: "none"}}, 
            React.createElement("p", null, "It is an way to represent various kinds of elements in your" + ' ' +
            "universe. By just needing a name, it can be a character," + ' ' +
            "an animal, an object, anything really that needs properties."), 

            React.createElement("p", null, "Imagine your main character John J. Doe who is 29 years old" + ' ' +
            "and has brown hair. This is a way to bring him into the" + ' ' +
            "universe.")
          ), 

          React.createElement("div", {className: "panel-heading", onClick: this.collapse}, 
            React.createElement("h4", null, React.createElement("a", {href: "#collapse"}, "How can a prop be used?"))
          ), 
          React.createElement("div", {className: "panel-body", style: {display: "none"}}, 
            React.createElement("p", null, "It only makes sense to define a prop, when it can be used inside" + ' ' +
            "a story. At the moment you link the prop name in the story" + ' ' +
            "and hide the link behind a description."), 

            React.createElement("p", null, "Take your main character John J. Doe, who has the prop" + ' ' +
            "name ", React.createElement("i", null, "john_j_doe"), ". Reference him in any story by adding" + ' ' +
            "[john_j_doe|John Doe] and he will appear as a link."), 

            React.createElement("p", null, "The second option, the name for the link is a choice made" + ' ' +
            "for universes that evolve. Maybe in your progress, John will" + ' ' +
            "receive a crown, or knighthood. Suddenly in the next story" + ' ' +
            "he is King John, but changing the link name everywhere would" + ' ' +
            "be spoiling it.")
          ), 

          React.createElement("div", {className: "panel-heading", onClick: this.collapse}, 
            React.createElement("h4", null, React.createElement("a", {href: "#collapse"}, "What is an access key?"))
          ), 
          React.createElement("div", {className: "panel-body", style: {display: "none"}}, 
            React.createElement("p", null, "It is the username equivalent. If you play with a bunch of" + ' ' +
            "people, try to create as many access keys as you have players."), 

            React.createElement("p", null, "An access key can and should have a name, one for you to" + ' ' +
            "remember who you gave the key to.")
          ), 

          React.createElement("div", {className: "panel-heading", onClick: this.collapse}, 
            React.createElement("h4", null, React.createElement("a", {href: "#collapse"}, "Are there different access rights?"))
          ), 
          React.createElement("div", {className: "panel-body", style: {display: "none"}}, 
            React.createElement("p", null, "There are three access rights. Manage, write and read."), 

            React.createElement("p", null, "A manage key can do everything and anything, obviously."), 

            React.createElement("p", null, "A write key can edit names, add and remove props, stories" + ' ' +
            "and poses, however it cannot delete a universe, see or edit" + ' ' +
            "access keys or change his own access key name."), 

            React.createElement("p", null, "A read key can obviously just read, there is not single write" + ' ' +
            "or manage task it can perform. Also it cannot see access keys.")
          ), 

          React.createElement("div", {className: "panel-heading", onClick: this.collapse}, 
            React.createElement("h4", null, React.createElement("a", {href: "#collapse"}, "What if someone deletes my" + ' ' +
              "universe?"))
          ), 
          React.createElement("div", {className: "panel-body", style: {display: "none"}}, 
            React.createElement("p", null, "This is on the to-do list. Right now the old saying from" + ' ' +
            "the BOFH applies - you better have a backup."), 

            React.createElement("p", null, "You can backup ", React.createElement("span", {className: "glyphicon glyphicon-download", 
            "aria-hidden": "true"}), " and ", React.createElement("span", {
            className: "glyphicon glyphicon-upload", "aria-hidden": "true"}), " restore" + ' ' +
            "your universe with a simple button click. Just remember," + ' ' +
            "it will wipe the universe you apply the backup to."), 

            React.createElement("p", null, "A restore also will not set up access keys for you!")
          )
        ))
      )
    );
  }
});
