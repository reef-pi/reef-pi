import React, { Component } from 'react';

import Outlets from './outlets.jsx'
import Boards from './boards.jsx';

export default class Electronics extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange(){
    }

    render() {
      return (
          <div>
            <h2>Outlets</h2>
            <Outlets />
            <hr/>
            <h2>Boards</h2>
            <Boards />
          </div>
          );
    }
}
