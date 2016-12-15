import React, { Component } from 'react';

import Outlets from './outlets.jsx'
import AddBoard from './add_board.jsx';
import BoardsList from './list_boards.jsx';

export default class Electronics extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange(){
    }

    render() {
      return (
          <div>
            <h2><span className="label label-info">Outlets</span></h2>
            <Outlets />
            <hr/>
            <h2><span className="label label-info">Boards</span></h2>
            <BoardsList />
            <AddBoard />
          </div>
          );
    }
}
