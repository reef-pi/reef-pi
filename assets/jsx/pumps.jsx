import React from 'react';

export default class Pumps extends React.Component {
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
            div className = "container" >
            <
            div className = "row" >
            <
            div className = "col-sm-4" > Return pump < /div> <
            div className = "col-sm-4" > < input type = "button"
            value = "On/Off" / > < /div> < /
            div > <
            div className = "row" >
            <
            div className = "col-sm-4" > Power Head < /div> <
            div className = "col-sm-4" > < input type = "button"
            value = "On/Off" / > < /div> < /
            div > <
            /div> <
            div className = "container"
            style = {
                borderStyle
            } >
            <
            div className = "row" >
            <
            div className = "col-sm-4" > Setup wave maker < /div> <
            div className = "col-sm-4" > < input type = "button"
            value = "On/Off" / > < /div> < /
            div > <
            div className = "col-sm-8" >
            Run after < input type = "text"
            value = "4h"
            onChange = {
                this.onChange
            }
            /> for <input type="text" value="4m" onChange={this.onChange}/ >
            <
            /div> < /
            div > <
            /div>
        );
    }
}