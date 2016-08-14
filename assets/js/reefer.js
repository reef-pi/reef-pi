
function consoleLog(data) {
    $("#console").text(data);
}
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
        consoleLog(data);
      },
      error: function(xhr, status, err) {
        consoleLog(err.toString());
      }
    });
  },
  render: function(){
    return (
      <button type="button" class="btn btn-default" onClick={this.onClick}>{this.state.on}</button>
    );
  }
});

ReactDOM.render(
    <Device url="/api/heater" />,
    document.getElementById('heater')
);
ReactDOM.render(
    <Device url="/api/light" />,
    document.getElementById('light')
);
ReactDOM.render(
    <Device url="/api/pump" />,
    document.getElementById('pump')
);
ReactDOM.render(
    <Device url="/api/doser" />,
    document.getElementById('doser')
);
