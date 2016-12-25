import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Equipment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          outlet:{}
        };
        this.fetchEquipment = this.fetchEquipment.bind(this);
        this.fetchOutlet = this.fetchOutlet.bind(this);
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
      return (
          <div>
            Board: {this.state.outlet.board}
            Pin: {this.state.outlet.pin}
            Type: {this.state.outlet.type}
          </div>
          );
    }
}
