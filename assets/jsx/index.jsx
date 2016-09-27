
var ReactDOM = require('react-dom');
var Device = require('./device.jsx')
var Schedule = require('./schedule.jsx')

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
