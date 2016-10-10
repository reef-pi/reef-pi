import React from 'react';

export default class Settings extends React.Component {
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
            TODO
            <ul>
              <li> Devices </li>
              <li> Schedules </li>
              <li> Modules </li>
            </ul>
          </div>
          );
    }
}
