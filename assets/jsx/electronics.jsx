import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';

export default class Electronics extends React.Component {
    constructor(props) {
        super(props);
        this.pinLayouts = {
          'pi': 40,
          'pca9645':12,
          'l293d': 8,
          'relay': 8
        };
        this.state = {
          board: '',
          table_rows: ''
        };
        this.onBoardChange = this.onBoardChange.bind(this)
    }
    onBoardChange(key, ev){
      var table_rows = []
      for (var i =1; i <= this.pinLayouts[key]; i++) {
        table_rows.push(
          <tr key={"Pin"+i}>
            <td>{i} </td>
            <td> <input type="text" /></td>
          </tr>)
      }
      this.setState({
        board: key,
        table_rows: table_rows
      });
    }

    render() {
      var divStyle={display: 'block'};
      if(this.state.board == '') {
        divStyle['display'] = 'none';
      }
      return (
          <div>
            <DropdownButton  title="Board" id="board" onSelect={this.onBoardChange}>
              <MenuItem eventKey="pi">Pi</MenuItem>
              <MenuItem eventKey="pca9645">PCA9645</MenuItem>
              <MenuItem eventKey="relay" >Relay</MenuItem>
              <MenuItem eventKey="l293d">L293D</MenuItem>
            </DropdownButton>
            <div style={divStyle}>
              {this.state.board} pin layout
              <Table condensed>
                <thead>
                  <tr>
                    <th>Pin</th>
                    <th>Connected to</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.table_rows}
                </tbody>
              </Table>
              <input type="button" value="save" />
            </div>
          </div>
          );
    }
}
