import React from 'react';
import $ from 'jquery';

class DeviceDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          visible: false,
          in_progress: false,
          loaded: false,
          type: '',
          pin: '',
          on: false
        };
        this.showDetails = this.showDetails.bind(this)
        this.loadState = this.loadState.bind(this)
        this.configureDevice = this.configureDevice.bind(this)
    }
    configureDevice(){
        this.setState({
          in_progress: true,
        });
        $.ajax({
            url: '/api/devices/'+ this.props.name+'/config',
            type: 'POST',
            data: JSON.stringify({on: this.state.on}),
            success: function(data) {
                this.setState({
                  on: !this.state.on,
                  in_progress: false
                });
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({
                  in_progress: false
                });
                console.log(err.toString());
            }.bind(this)
        });
    }
    showDetails() {
      this.setState({
        visible: !this.state.visible
      });
      console.log("Device:", this.props.name, " visible:", this.state.visible)
    }
    loadState(){
        if(this.state.loaded) {
          return;
        }
        $.ajax({
            url: '/api/devices/'+ this.props.name,
            type: 'GET',
            success: function(data) {
                this.setState({
                  loaded: true,
                  type: 'Foo',
                  pin: data.config.pin
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }.bind(this)
        });
    }
    render() {
      var style = {
        display: this.state.visible ? 'block' : 'none'
      };
      if(this.state.visible){
        this.loadState();
      }
      return (
          <div>
            <span onClick={this.showDetails}>{this.props.name}</span>
            <table style={style}>
              <tbody>
                <tr><td>Name</td><td>{this.props.name}</td></tr>
                <tr><td>Type</td><td>{this.state.type}</td></tr>
                <tr><td>Pin</td><td>{this.state.pin}</td></tr>
                <tr><td></td><td><input type="button" disabled={this.state.in_progress} value={this.state.expected_on ? "Off" : "On"} onClick={this.configureDevice}/></td></tr>
              </tbody>
            </table>
          </div>
          );
    }
}

export default class Devices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: []
        };
        this.loadDevices = this.loadDevices.bind(this)
        this.loadDeviceDetails = this.loadDeviceDetails.bind(this)
    }
    loadDevices() {
        $.ajax({
            url: '/api/devices',
            type: 'GET',
            success: function(data) {
                this.setState({
                    devices: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }.bind(this)
        });
    }
    loadDeviceDetails(e) {
        console.log(data);
    }
    componentDidMount() {
        this.loadDevices()
    }
    render() {

        var list = []
        this.state.devices.map(function(d, i) {
          list.push(<li key={d}><DeviceDetails name={d} /></li>);
        });
        return (
          <div className="container">
            List of devices
            <ul>
              {list}
            </ul>
          </div>
        );
    }
}
