import React from 'react';
import $ from 'jquery';

export default class Devices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: []
        };
        this.loadDevices.bind(this)
        this.loadDeviceDetails.bind(this)
    }
    loadDevices() {
        $.ajax({
            url: '/api/devices',
            type: 'GET',
            success: function(data) {
                this.setState({
                    devices: data
                });
                console.log(data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }
        });
    }
    loadDeviceDetails(e) {
        console.log(data);
    }
    componentDidMount() {
        this.loadDevices()
    }
    render() {

        var list = this.state.devices.map(function(d) {
            return <ul > < a onClick = {
                this.loadDeviceDetails
            } > {
                d
            } < /a></ul >
        });
        return ( <
            div className = "container" >
            List of devices <
            ul > {
                list.join("")
            } <
            /ul> < /
            div >
        );
    }
}