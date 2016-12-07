import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

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
          table_rows: []
        };
        this.onBoardChange = this.onBoardChange.bind(this);
        this.loadConfiguration = this.loadConfiguration.bind(this);
        this.saveConfiguration = this.saveConfiguration.bind(this);
    }

    loadConfiguration(){
      $.ajax({
          url: '/api/board/'+this.state.board,
          type: 'GET',
          success: function(data) {
            this.setState({
            });
          }.bind(this),
          error: function(xhr, status, err) {
              console.log(err.toString());
          }.bind(this)
      });
    }

    onBoardChange(key, ev){
      var table_rows = []
      for (var i =1; i <= this.pinLayouts[key]; i++) {
        table_rows.push(
          <tr key={"Pin"+i}>
            <td>{i} </td>
            <td> <input id={"pin-"+i}type="text"/></td>
          </tr>)
      }
      this.setState({
        board: key,
        table_rows: table_rows
      });
    }

    saveConfiguration(){
      var payload = {}
      for (var i =1; i <= this.pinLayouts[this.state.board]; i++) {
        payload["pin-"+i] = $("#pin-"+i).val()
      }
      console.log(payload)
      $.ajax({
          url: '/api/config/board/'+this.state.board,
          type: 'POST',
          data: JSON.stringify(payload),
          success: function(data) {
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    render() {
      var divStyle={display: 'block'};
      if(this.state.board == '') {
        divStyle['display'] = 'none';
      }
      return (
          <div>
            <DropdownButton  title="Board" id="board" onSelect={this.onBoardChange} dropup>
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
              <input type="button" value="save" onClick={this.saveConfiguration}/>
            </div>
          </div>
          );
    }
}
