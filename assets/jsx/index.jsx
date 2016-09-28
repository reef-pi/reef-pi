
var ReactDOM = require('react-dom');
var Device = require('./device.jsx')
var Schedule = require('./schedule.jsx')
var Slider = require('./slider.jsx')

ReactDOM.render(
    <Device url="/api/relay_1" name="Relay 1"/>,
    document.getElementById('relay_1')
);
ReactDOM.render(
    <Device url="/api/relay_2" name="Relay 2"/>,
    document.getElementById('relay_2')
);
ReactDOM.render(
    <Device url="/api/doser_1" name="Doser 1"/>,
    document.getElementById('doser_1')
);
ReactDOM.render(
    <Device url="/api/doser_2" name="Doser 2"/>,
    document.getElementById('doser_2')
);
ReactDOM.render(
    <Schedule url="/api/schedule" />,
    document.getElementById('schedule')
);
ReactDOM.render(
    <Slider />,
    document.getElementById('slider')
);
