import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Outlets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          outlets: {}
        };
        this.loadConfiguration = this.loadConfiguration.bind(this);
        this.saveConfiguration = this.saveConfiguration.bind(this);
        this.onChange = this.onChange.bind(this);
        this.generateTBody = this.generateTBody.bind(this)
    }

    onChange(ev){
      var os = this.state.outlets
      os[ev.target.id] = ev.target.value
      this.setState({
        outlets: os
      });
    }

    loadConfiguration(){
      $.ajax({
          url: '/api/outlets',
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            this.setState({
              outlets: data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    generateTBody(){
      console.log("TBody generated")
      var rows =[]
      $.each(this.state.outlets, function(k, v){
        rows.push(
        <tr key={k}>
          <td>{k} </td>
          <td><input id={k} type="text" value={v} onChange={this.onChange}/></td>
        </tr>
        )
      }.bind(this));
      return <tbody>{rows}</tbody>;
    }

    saveConfiguration(){
      var payload = {}
      $.ajax({
          url: '/api/outlets',
          type: 'POST',
          dataType: 'json',
          data: JSON.stringify(this.state.outlets),
          success: function(data) {
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    componentWillMount(){
      this.loadConfiguration();
    }



    render() {
      return (
          <div>
            <Table responsive>
              <thead>
                <tr>
                  <th>Outlet</th>
                  <th>Wire connection</th>
                </tr>
              </thead>
              {this.generateTBody()}
            </Table>
            <input type="button" value="save" onClick={this.saveConfiguration}/>
          </div>
          );
    }
}
