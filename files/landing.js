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

      React.createElement("div", {className: "col-xs-4 col-md-4", style: {border: "1px solid #ddd",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "5px"}}, 
        React.createElement("h4", null, "The what!"), 
        React.createElement("p", null, 
          "A platform to roleplay, write, create, dream and share your stories," + ' ' +
          "adventures and fantasies. Collaborate with friends or likeminded" + ' ' +
          "people. Create your own universe!"
        )
      ), 
      React.createElement("div", {className: "col-xs-4 col-md-4", style: {border: "1px solid #ddd",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "5px"}}, 
        React.createElement("h4", null, "The how!"), 
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
      ), 
      React.createElement("div", {className: "col-xs-4 col-md-4", style: {border: "1px solid #ddd",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "5px"}}, 
        React.createElement("h4", null, "The collaboration!"), 
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
      ), 
      React.createElement("div", {className: "col-xs-12 col-md-12 panel-group", id: "accordion"}, 
        React.createElement("h3", null, "FAQ"), 
        React.createElement("h4", {onClick: this.collapse}, 
          React.createElement("a", {href: "#collapse"}, "What is a prop?")
        ), 
        React.createElement("div", {className: "well", style: {display: "none"}}, "Yays")
      )
    );
  }
});
