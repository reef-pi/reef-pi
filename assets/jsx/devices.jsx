import React from 'react';
import $ from 'jquery';

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
          list.push(<li key={d}>{d}</li>);
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
