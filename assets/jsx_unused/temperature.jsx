import React from 'react';

export default class Temperature extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange(){
    }

    render() {
      var borderStyle = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#dddddd'
      };
      return (
          <div className="container">
            <div className="col-sm-8">
               <input type="button" value="On/Off"/>
            </div>
            <div  className="container" style={borderStyle}>
              <div className="col-sm-8">
                Switch on heater when temperature goes below
                <input type="text" value="77F" onChange={this.onChange}/>
              </div>
              <div className="col-sm-8">
                Switch off heater when temperature goes above
                <input type="text" value="80F" onChange={this.onChange}/>
              </div>
            </div>
          </div>
          );
    }
}
