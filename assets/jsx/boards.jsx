import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Boards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          board: '',
          table_rows: [],
          boards: {
            'pi': {
              'total': 40,
              'layout': {}
            },
            'pca9645':{
              'total': 12,
              'layout': {}
            },
            'l293d': {
              'total': 8,
              'layout': {}
            },
            'relay': {
             'total': 8,
             'layout': {}
            }
          }
        };
        this.loadConfiguration = this.loadConfiguration.bind(this);
        this.saveConfiguration = this.saveConfiguration.bind(this);
        this.onChange = this.onChange.bind(this);
        this.generateTBody = this.generateTBody.bind(this);
        this.generateMenuList = this.generateMenuList.bind(this);
    }

    onChange(ev){
      var boards = $.extend({}, this.state.boards)
      var pin = ev.target.id
      boards[this.state.board]['layout'][pin] = ev.target.value
      this.setState({
        boards: boards
      });
    }

    generateTBody(){
      if (this.state.board == ""){
        return;
      }
      var rows =[]
      var layout = this.state.boards[this.state.board]['layout'];
      var pinCount = this.state.boards[this.state.board]['total'];
      for (var i =1; i <= pinCount; i++) {
        var pin = "pin-"+i
        rows.push(
          <tr key={pin}>
            <td>{i} </td>
            <td> <input id={pin} type="text" value={layout[pin]} onChange={this.onChange}/></td>
          </tr>
        )
      };
      return <tbody>{rows}</tbody>;
    }

    loadConfiguration(key, ev){
      $.ajax({
          url: '/api/board/' + key,
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            var boards = $.extend({}, this.state.boards);
            boards[key]['layout'] = data
            this.setState({
              board: key,
              boards: boards
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    saveConfiguration(){
      var payload = {}
      for (var i =1; i <= this.state.boards[this.state.board]['total']; i++) {
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

    generateMenuList(){
      var menuItems = []
      $.each(this.state.boards, function(k,v){
        menuItems.push(<MenuItem key={k} eventKey={k}>{k}</MenuItem>)
      }.bind(this));
      return menuItems
    }

    render() {
      var divStyle={display: 'block'};
      if(this.state.board == '') {
        divStyle['display'] = 'none';
      }
      return (
          <div>
            <hr />
            <DropdownButton  title="Board" id="board" onSelect={this.loadConfiguration} dropup>
              {this.generateMenuList()}
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
                {this.generateTBody()}
              </Table>
              <input type="button" value="save" onClick={this.saveConfiguration}/>
            </div>
          </div>
          );
    }
}
