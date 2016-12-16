import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import $ from 'jquery';
import Connection from "./connection.jsx";

export default class Outlets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          outlets: [],
          addOutlet: false,
          connection: {}
        };

        this.fetchData = this.fetchData.bind(this);
        this.addOutlet = this.addOutlet.bind(this);
        this.removeOutlet = this.removeOutlet.bind(this);
        this.onChange = this.onChange.bind(this);
        this.listOutlets = this.listOutlets.bind(this)
        this.setConnection = this.setConnection.bind(this);
        this.toggleAddOutletDiv = this.toggleAddOutletDiv.bind(this);
    }

    componentWillMount(){
      this.fetchData();
    }

    setConnection(conn){
      this.setState({
        connection: conn
      });
    }

    toggleAddOutletDiv() {
      this.setState({
        addOutlet: !this.state.addOutlet
      });
      $('#outlet-name').val('');
    }

    removeOutlet(ev){
      var outletID = ev.target.id.split("-")[1]
      $.ajax({
          url: '/api/outlets/' + outletID,
          type: 'DELETE',
          success: function(data) {
            this.fetchData();
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    onChange(ev){
      var os = this.state.outlets
      os[ev.target.id] = ev.target.value
      this.setState({
        outlets: os
      });
    }

    fetchData(){
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

    listOutlets(){
      var rows =[]
      $.each(this.state.outlets, function(k, v){
        rows.push(
          <li key={v.id}><span>{v.name} </span> <input id={"outlet-"+v.id} type="button" value="delete" onClick={this.removeOutlet} /></li>
        )
      }.bind(this));
      return rows;
    }

    addOutlet(){
      var payload = {
        name: $('#outlet-name').val(),
        connection: this.state.connection
      }
      $.ajax({
          url: '/api/outlets',
          type: 'PUT',
          data: JSON.stringify(payload),
          success: function(data) {
            this.fetchData();
            this.toggleAddOutletDiv();
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    render() {
      var dStyle = {
          display: this.state.addOutlet ? 'block' : 'none'
      };
      return (
          <div>
            <ul>
              {this.listOutlets()}
            </ul>
            <div>
              <input type="button" value={this.state.addOutlet ? "-" : "+" } onClick = {this.toggleAddOutletDiv}/>
              <table style={dStyle}>
                <tbody>
                  <tr>
                      <td>
                        Name: <input type="text" id="outlet-name"/>
                      </td>
                      <td>
                        <Connection updateHook={this.setConnection}/>
                      </td>
                      <td>
                        <input type="button" value="save" onClick={this.addOutlet} />
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          );
    }
}
