var Landing = React.createClass({
  getInitialState: function() {
    return {};
  },
  initSlider(): function() {
  },
  sliderStop: function(e) {
  },
  componentDidMount: function() {
    this.initSlider();
  },
  renderSlider: function() {
    var elements = [
      "cookies",
      "monsters",
      "sprites"
    ];
    return <div className="row" ref="slider" onMouseOver={this.sliderStop}>
      {elements.map(function(elem) {
        return <div className="col-xs-12 col-md-12 hidden">{elem}</div>;
      })}
    </div>;
  },
  render: function() {
    return <div className="col-xs-12 col-md-12"
      style={{backgroundColor: "#e5e5e5", minHeight: "50%",
      borderRadius: "5px"}}>

      {this.renderSlider()}
    </div>;
  }
});
