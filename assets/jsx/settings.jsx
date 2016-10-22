import React from 'react';

import Devices from './devices.jsx'

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange() {}

    render() {
        var borderStyle = {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#dddddd'
        };
        return ( <
            div className = "container" >
            <
            Devices / >
            <
            ul >
            <
            li > Schedules < /li> <
            li > Modules < /li> < /
            ul > <
            /div>
        );
    }
}