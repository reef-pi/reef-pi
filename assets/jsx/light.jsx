import React from 'react';
import Slider from './slider.jsx'

export default class Light extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
      var tdStyle = {
        textAlign: 'center',
      };
      var tableStyle = {
       width: '50%'
      };
      return (
          <div className="container">
            <div className="row">
              <input type="button" value="On/Off"/>
            </div>
            <hr/>
            <div className="row">
                <Slider index="1"/>
            </div>
          </div>
      );
    }
}
