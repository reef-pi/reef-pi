import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import $ from 'jquery';
import Connection from "./connection.jsx";

export default class Outlets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          outlets: [],
          connection: {}
        };

        this.fetchData = this.fetchData.bind(this);
        this.addOutlet = this.addOutlet.bind(this);
        this.removeOutlet = this.removeOutlet.bind(this);
        this.onChange = this.onChange.bind(this);
        this.listOutlets = this.listOutlets.bind(this)
        this.setConnection = this.setConnection.bind(this);
    }

    componentDidMount(){
      this.fetchData();
    }

    setConnection(conn){
      this.setState({
        connection: conn
      });
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
          <li key={v.id}><span>{v.name} </span> <input id={"outlet-"+v.id} type="button" value="delete" onClick={this.removeOutlet} className="btn btn-danger"/></li>
        )
      }.bind(this));
      return <tbody>{rows}</tbody>;
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
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    render() {
      return (
          <div>
            <ul>
              {this.listOutlets()}
            </ul>
            <div>
              <table>
                <tbody>
                  <tr>
                      <td>
                        Name: <input type="text" id="outlet-name"/>
                      </td>
                      <td>
                        <Connection updateHook={this.setConnection}/>
                      </td>
                      <td>
                        <input type="button" value="save" onClick={this.addOutlet} className="btn btn-success"/>
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          );
    }
}
