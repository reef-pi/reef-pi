var React = require('react');

var Slider = React.createClass({
  getInitialState: function(){
    return {value: 0};
  },
  onChange: function(e){
    this.setState({value: e.target.value})
    console.log("Slider value: " + this.state.value)
  },
  render: function(){
    return (
      <div>
        <input className="col-xs" type="range" onChange={this.onChange} value={this.state.value}/>
        <input type="text" className="col-xs" value={this.state.value} />
      </div>
    );
  }
});

module.exports = Slider;
