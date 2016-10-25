import React from 'react';
import Slider from './slider.jsx'

export default class Lighting extends React.Component {
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
      var sliderSetStyle = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#dddddd'
      };
      return (
          <div className="container">
            <div className="row">
              <input type="button" value="On/Off"/>
            </div>
            <div className="row" style={sliderSetStyle}>
            Set Dusk to Dawn effect
              <table>
                <tbody>
                  <tr>
                    <Slider time="0h"/>
                    <Slider time="2h"/>
                    <Slider time="4h"/>
                    <Slider time="6h"/>
                    <Slider time="8h"/>
                    <Slider time="10h"/>
                    <Slider time="12h"/>
                    <Slider time="14h"/>
                    <Slider time="16h"/>
                    <Slider time="18h"/>
                    <Slider time="20h"/>
                    <Slider time="22h"/>
                  </tr>
                </tbody>
              </table>
              <input type="button" value="Set"/>
            </div>
          </div>
      );
    }
}
