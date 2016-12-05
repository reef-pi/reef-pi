import React, { Component } from 'react';

import Outlets from './outlets.jsx'
import Electronics from './electronics.jsx'

export default class Configuration extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange(){
    }

    render() {
      return (
          <div>
            <hr/>
            <Outlets />
            <hr/>
            <Electronics />
          </div>
          );
    }
}
