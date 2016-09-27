var React = require('react');

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
        console.log(data);
      },
      error: function(xhr, status, err) {
        console.log(err.toString());
      }
    });
  },
  render: function(){
    return (
      <div>
      <label>Device</label>
      <input type="text" value={this.state.device} onChange={this.onDeviceChange}/>
      <label>Duration</label>
      <input type="text" value={this.state.duration} onChange={this.onDurationChange}/>
      <label>Interval</label>
      <input type="text" value={this.state.interval} onChange={this.onIntervalChange}/>
      <button type="button" className="btn btn-default" onClick={this.onClick}>{this.state.on}</button>
      </div>
    );
  }
});

module.exports = Schedule;
