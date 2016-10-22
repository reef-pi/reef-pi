var React = require('react');

var Device = React.createClass({
    getInitialState: function() {
        return {
            on: false,
            onString: "Off",
            className: "btn btn-danger"
        };
    },
    onClick: function(e) {
        var on = !this.state.on
        var name = this.props.name
        $.ajax({
            url: '/api/device',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                on: on,
                name: name
            }),
            cache: false,
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, err) {
                console.log(err.toString());
            }
        });
        var onString = on ? "On" : "Off";
        var className = on ? "btn btn-success" : "btn btn-danger";
        this.setState({
            on: on,
            onString: onString,
            className: className
        });
    },
    render: function() {
        return ( <
            input readOnly = "true"
            className = {
                this.state.className
            }
            onClick = {
                this.onClick
            }
            value = {
                this.props.name
            }
            />
        );
    }
});

module.exports = Device;