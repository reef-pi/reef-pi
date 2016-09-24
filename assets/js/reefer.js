
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

var Schedule = React.createClass({
  getInitialState: function(){
    return {
      device: "relay_1",
      interval: "10s",
      duration: "2s",
      on: "On"
    };
  },
  onIntervalChange: function(event) {
    this.setState({interval: event.target.value});
  },
  onDurationChange: function(event) {
    this.setState({duration: event.target.value});
  },
  onDeviceChange: function(event) {
    this.setState({device: event.target.value});
  },
  onClick: function(e){
    if (this.state.on == "On") {
      this.setState({on: "Off"})
    } else {
      this.setState({on: "On"})
    }
    $.ajax({
      url: this.props.url,
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(this.state),
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
      <div>
      <label>Device</label>
      <input type="text" value={this.state.device} onChange={this.onDeviceChange.bind(this)}/>
      <label>Duration</label>
      <input type="text" value={this.state.duration} onChange={this.onDurationChange.bind(this)}/>
      <label>Interval</label>
      <input type="text" value={this.state.interval} onChange={this.onIntervalChange.bind(this)}/>
      <button type="button" class="btn btn-default" onClick={this.onClick}>{this.state.on}</button>
      </div>
    );
  }
});


ReactDOM.render(
    <Device url="/api/relay_1" />,
    document.getElementById('relay_1')
);
ReactDOM.render(
    <Device url="/api/relay_2" />,
    document.getElementById('relay_2')
);
ReactDOM.render(
    <Device url="/api/doser_1" />,
    document.getElementById('doser_1')
);
ReactDOM.render(
    <Device url="/api/doser_2" />,
    document.getElementById('doser_2')
);
ReactDOM.render(
    <Schedule url="/api/schedule" />,
    document.getElementById('schedule')
);
