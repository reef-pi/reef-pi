import React from 'react';

export default class Dashboard extends React.Component {
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
              <li> List current temperature, saliniy, PH, ORP </li>
              <li> Time series chart </li>
              <li> Screenshot of the tank </li>
            </ul>
          </div>
          );
    }
}
