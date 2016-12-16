import React from 'react';

export default class ATO extends React.Component {
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
                Turn on ATO when water level goes below
              </div>
              <div className="col-sm-4">
                <input type="text" value="6" onChange={this.onChange}/>
              </div>
              <div className="col-sm-8">
                Turn off ATO when water goes above
                </div>
              <div className="col-sm-4">
                <input type="text" value="8" onChange={this.onChange}/>
              </div>
              <div className="col-sm-8">
                Check after every
              </div>
              <div className="col-sm-4">
                <input type="text" value="4h" onChange={this.onChange}/>
              </div>
            </div>
          </div>
          );
    }
}
