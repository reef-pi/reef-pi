var React = require('react');

var Device = React.createClass({
  getInitialState: function(){
    return {on: 'On'};
  },
  onClick: function(e){
    var desired_state = ""
    if(this.state.on == "On") {
      desired_state = "off"
    }else{
      desired_state = "on"
    }
    this.setState({on: desired_state})
    var deviceUrl = this.props.url
    $.ajax({
      url: deviceUrl,
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({on: desired_state == 'on'}),
      cache: false,
      success: function(data) {
        console.log(data);
      },
      error: function(xhr, status, err) {
        console.log(err.toString());
      }
    });
  },
  render: function(){
    return (
      <button type="button" className="btn btn-default" onClick={this.onClick}>{this.state.on}</button>
    );
  }
});

module.exports = Device;
