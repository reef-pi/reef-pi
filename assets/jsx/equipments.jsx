import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';
import EquipmentList from "./equipment_list.jsx"

export default class Equipments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          selectedOutlet: 'AC_110_1',
          outlets: [
            "AC_110_1",
            "AC_110_2",
            "AC_110_3",
            "AC_110_4",
            "AC_110_5",
            "AC_110_6"
          ]
        };
        this.setOutlet = this.setOutlet.bind(this);
        this.outletList = this.outletList.bind(this);
        this.addEquipment = this.addEquipment.bind(this);
    }

    setOutlet(k, ev){
      this.setState({
        selectedOutlet: k
      });
    }

    outletList(){
      var menuItems = []
      $.each(this.state.outlets, function(v,k){
        menuItems.push(<MenuItem key={k} eventKey={k}>{k}</MenuItem>)
      }.bind(this));
      return menuItems

    }

    addEquipment(){
      var payload = {
        name: $("#equipmentName").val(),
        outlet: this.state.selectedOutlet
      }
      $.ajax({
          url: '/api/equipments',
          type: 'PUT',
          data: JSON.stringify(payload),
          success: function(data) {
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    render() {
      return (
          <div>
           <EquipmentList />
           <hr/>
           Add
           <br />
           Name: <input type="text" id="equipmentName" />
           Outlet:
           <DropdownButton
             title={this.state.selectedOutlet}
             id="outlet"
             onSelect={this.setOutlet}>
              {this.outletList()}
            </DropdownButton>
            <input type="button" value="save"  onClick={this.addEquipment} />
          </div>
          );
    }
}
