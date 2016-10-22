import React from 'react';
import Devices from './devices.jsx';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import $ from 'jquery';

export default class DeviceManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addDevice: false,
            deviceType: 'relay',
            deviceConfig: {foo: 'bar'},
            deviceName: '',
            devicePin: '',
        };
        this.addDevice = this.addDevice.bind(this)
        this.selectDeviceType = this.selectDeviceType.bind(this)
        this.submitDevice = this.submitDevice.bind(this)
        this.setDeviceName = this.setDeviceName.bind(this)
        this.setDevicePin = this.setDevicePin.bind(this)
    }
    addDevice() {
        this.setState({
            addDevice: !this.state.addDevice
        })
    }
    setDevicePin(e) {
        this.setState({
          devicePin: e.target.value
        })
    }
    setDeviceName(e) {
        this.setState({
          deviceName: e.target.value
        })
    }
    selectDeviceType(e){
        this.setState({
           deviceType: e.target.value
        });
    }
    submitDevice(e){
        var deviceType = this.state.deviceType;
        var deviceName = this.state.deviceName;
        var devicePin = this.state.devicePin;
        $.ajax({
            url: '/api/devices',
            type: 'POST',
            data: JSON.stringify({
              type: deviceType,
              config:  {
                name: deviceName,
                pin: devicePin
              }
            }),
            success: function(data) {
              this.setState({
                  addDevice: !this.state.addDevice
              });
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }.bind(this)
        });
    }

    render() {
        var borderStyle = {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#dddddd'
        };
        var dStyle = {
            display: this.state.addDevice ? 'block' : 'none'
        };
        return ( 
            <div className = "container" >
              <div className = "col-sm-12" >
                <Devices />
              </div>
              <div className = "col-sm-12" >
                <input type = "button" value = {this.state.addDevice ? "-" : "+" } onClick = {this.addDevice}/>
                <div className = "container" style = {dStyle}>
                  <div className = "col-sm-12" style = {borderStyle}>
                    <table>
                      <tbody>
                        <tr>
                          <td> Type </td>
                          <td>
                            <select value={this.state.deviceType} onChange={this.selectDeviceType}>
                              <option value="relay"> Relay</option>
                              <option value="doser"> Doser</option>
                            </select>
                          </td>
                        </tr>
                        <tr><td>Name</td><td><input type="text" onChange={this.setDeviceName}/></td></tr>
                        <tr><td>Pin</td><td><input type="text"  onChange={this.setDevicePin}/> </td></tr>
                        <tr><td></td><td><input type = "button"  value = "add" onClick = {this.submitDevice}/></td></tr>
                      </tbody>
                    </table>
                  </div >
                </div>
              </div >
            </div>
        );
    }
}
