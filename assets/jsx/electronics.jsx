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
        this.loadConfiguration = this.loadConfiguration.bind(this);
        this.saveConfiguration = this.saveConfiguration.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onChange(ev){
      var pin = ev.target.id
      var i = pin.split("-")[1]
      var table_rows = this.state.table_rows
      var el = <tr key={pin}>
             <td>{i}</td>
             <td><input id={pin} type="text" value={ev.target.value} onChange={this.onChange}/></td>
           </tr>
      table_rows[i-1] = el
      this.setState({
        table_rows: table_rows
      });
    }

    loadConfiguration(key, ev){
      $.ajax({
          url: '/api/board/' + key,
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            var table_rows = []
            for (var i =1; i <= this.pinLayouts[key]; i++) {
              var pin = "pin-"+i
              table_rows.push(
                <tr key={pin}>
                  <td>{i} </td>
                  <td> <input id={pin} type="text" value={data[pin]} onChange={this.onChange}/></td>
                </tr>)
            }
            this.setState({
              board: key,
              table_rows: table_rows
            });
          }.bind(this),
          error: function(xhr, status, err) {
              console.log(err.toString());
          }.bind(this)
      });
    }

    saveConfiguration(){
      var payload = {}
      for (var i =1; i <= this.pinLayouts[this.state.board]; i++) {
        payload["pin-"+i] = $("#pin-"+i).val()
      }
      $.ajax({
          url: '/api/board/'+this.state.board,
          type: 'POST',
          dataType: 'json',
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
            <DropdownButton  title="Board" id="board" onSelect={this.loadConfiguration} dropup>
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
