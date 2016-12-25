import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Equipment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          outlet: {},
          action: 'on',
          value: ''
        };
        this.fetchEquipment = this.fetchEquipment.bind(this);
        this.fetchOutlet = this.fetchOutlet.bind(this);
        this.setValue = this.setValue.bind(this);
        this.configureEquipment = this.configureEquipment.bind(this);
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
      var rangeStyle = {};

      if(this.state.outlet.type != "pwm"){
        rangeStyle['display'] = 'none';
      }
      return (
          <div>
            <input type="range" style={rangeStyle} onChange={this.setValue} value={this.state.value}/>
            <input type="button" value={this.state.action} onClick={this.configureEquipment}/>
          </div>
          );
    }
}
