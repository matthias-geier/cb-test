var Landing = React.createClass({displayName: "Landing",
  getInitialState: function() {
    return {};
  },
  componentDidMount: function() {
  },
  render: function() {
    return React.createElement("div", {className: "col-xs-12 col-md-12", 
      style: {backgroundColor: "#e5e5e5", minHeight: "50%",
      borderRadius: "5px"}}, 

      React.createElement("div", {className: "row"}, 
        React.createElement("div", {className: "col-xs-4 col-md-4"}, 
          React.createElement("h4", null, "The what!"), 
          React.createElement("p", null, 
            "A platform to roleplay, write, create, dream and share your stories," + ' ' +
            "adventures and fantasies. Collaborate with friends or likeminded" + ' ' +
            "people. Create your own universe!"
          )
        ), 
        React.createElement("div", {className: "col-xs-4 col-md-4"}, 
          React.createElement("h4", null, "The how!"), 
          React.createElement("p", null, 
            "Get started by:", 
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
        React.createElement("div", {className: "col-xs-4 col-md-4"}, 
          React.createElement("h4", null, "The collaboration!"), 
          React.createElement("p", null, 
            "And here's how to invite friends:", 
            React.createElement("ul", null, 
              React.createElement("li", null, "Hit the huge ", React.createElement("span", {className: "glyphicon glyphicon-lock", 
                "aria-hidden": "true"}), " on your universe"), 
              React.createElement("li", null, "Hit the ", React.createElement("span", {className: "glyphicon glyphicon-plus", 
                "aria-hidden": "true"}), " to generate a new Access Key"), 
              React.createElement("li", null, "Send your friend the URL behind the new key")
            )
          )
        )
      )
    );
  }
});
