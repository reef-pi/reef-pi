var Device = React.createClass({
  getInitialState: function(){
    return {on: 'On'};
  },
  onClick: function(e){
    if(this.state.on == "On") {
      this.setState({on: 'Off'})
    }else{
      this.setState({on: 'On'})
    }
    console.error(this.props.url)
    var deviceUrl = this.props.url
    $.ajax({
      url: deviceUrl,
      type: 'POST',
      dataType: 'json',
      data: {state: this.state.on},
      cache: false,
      success: function(data) {
        alert(data);
      },
      error: function(xhr, status, err) {
        console.error(deviceUrl, status, err.toString());
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
