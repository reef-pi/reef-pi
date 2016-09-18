
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
      duration: "2s"
    };
  },
  onClick: function(e){
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
      <div class="form-group">
        <button type="button" class="btn btn-default" onClick={this.onClick}>Schedule</button>
        <label>Device</label>
        <input class="form-control" type="text" value="asd"></input>
        <label>Duration</label>
        <input class="form-control input-xs" type="text" value={this.state.duration} />
        <label>Interval</label>
        <input class="form-control input-xs" type="text" value={this.state.interval} />
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
