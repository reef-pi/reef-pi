import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Equipment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          outlet: {},
          action: 'on',
          value: 0
        };
        this.fetchEquipment = this.fetchEquipment.bind(this);
        this.fetchOutlet = this.fetchOutlet.bind(this);
        this.setValue = this.setValue.bind(this);
        this.configureEquipment = this.configureEquipment.bind(this);
        this.removeEquiment = this.removeEquiment.bind(this);
    }

    removeEquiment(ev){
      var equipmentID = this.props.id
      $.ajax({
          url: '/api/equipments/' + equipmentID,
          type: 'DELETE',
          success: function(data) {
            this.props.updateHook();
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    fetchEquipment(){
      $.ajax({
          url: '/api/equipments/'+this.props.id,
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            this.fetchOutlet(data.outlet);
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    configureEquipment() {
      $.ajax({
          url: '/api/outlets/' + this.state.outlet.id + '/configure',
          type: 'POST',
          data: JSON.stringify({
            action: this.state.action,
            value: Number(this.state.value)
          }),
          success: function(data) {
            this.setState({
              action: this.state.action == "on" ? "off": "on"
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    setValue(e){
      this.setState({
        value: parseInt(e.target.value)
      });
    }

    fetchOutlet(o){
      $.ajax({
          url: '/api/outlets/' + o,
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            this.setState({
              outlet: data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    componentWillMount(){
      this.fetchEquipment();
    }

    render() {
      var displayStyle = {};

      if(this.state.outlet.type != "pwm"){
        displayStyle['display'] = 'none';
      }
      return (
          <div className="container">
            <div className="row">
              <div className="col-sm-2"> <label>{this.props.name}</label></div>
              <div className="col-sm-2"><input  type="range" style={displayStyle} onChange={this.setValue} value={this.state.value}/></div>
              <div className="col-sm-1"><label style={displayStyle}>{this.state.value}</label></div>
              <div className="col-sm-1"><input type="button" style={displayStyle} onClick={this.configureEquipment} value="set" className="btn btn-outline-primary"/></div>
              <div className="col-sm-1"><input type="button" value={this.state.action} onClick={this.configureEquipment} className="btn btn-outline-primary"/></div>
              <div className="col-sm-1"><input type="button" value="delete" onClick={this.removeEquiment} className="btn btn-outline-danger"/></div>
            </div>
          </div>
          );
    }
}
