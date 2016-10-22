import React from 'react';
import $ from 'jquery';

export default class Schedule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            device: "relay_1",
            start: "8:00",
            stop: "17:00",
            on: "On"
        };
        this.onStartChange = this.onStartChange.bind(this);
        this.onStopChange = this.onStopChange.bind(this);
        this.onDeviceChange = this.onDeviceChange.bind(this);
        this.onClick = this.onClick.bind(this);
    }
    onStartChange(event) {
        this.setState({
            start: event.target.value
        });
    }
    onStopChange(event) {
        this.setState({
            stop: event.target.value
        });
    }
    onDeviceChange(event) {
        this.setState({
            device: event.target.value
        });
    }
    onClick(e) {
        if (this.state.on == "On") {
            this.setState({
                on: "Off"
            })
        } else {
            this.setState({
                on: "On"
            })
        }
        var payload = this.state;
        payload.on = payload.on == "On" ? true : false;
        console.log("Payload is:", payload)

        $.ajax({
            url: this.props.url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(payload),
            cache: false,
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, err) {
                console.log(err.toString());
            }
        });
    }

    render() {
        var borderStyle = {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#dddddd'
        };
        return ( <
            div className = "container" >
            <
            table >
            <
            tbody >
            <
            tr >
            <
            td colSpan = "3" > Device < /td> <
            td > < input type = "text"
            value = {
                this.state.device
            }
            onChange = {
                this.onDeviceChange
            }
            /></td >
            <
            /tr> <
            tr >
            <
            td > Start < /td> <
            td > < input type = "text"
            value = {
                this.state.start
            }
            onChange = {
                this.onStartChange
            }
            /></td >
            <
            td > Stop < /td> <
            td > < input type = "text"
            value = {
                this.state.stop
            }
            onChange = {
                this.onStopChange
            }
            /></td >
            <
            /tr> <
            tr >
            <
            td colSpan = "3" > < /td> <
            td >
            <
            input type = "button"
            value = "On/Off"
            onClick = {
                this.onClick
            }
            /> < /
            td > <
            /tr> < /
            tbody > <
            /table> < /
            div >
        );
    }
}