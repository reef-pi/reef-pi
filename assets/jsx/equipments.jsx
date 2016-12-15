import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';
import EquipmentList from "./equipment_list.jsx"

export default class Equipments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          selectedOutlet: undefined,
          outlets: []
        };
        this.setOutlet = this.setOutlet.bind(this);
        this.outletList = this.outletList.bind(this);
        this.addEquipment = this.addEquipment.bind(this);
        this.fetchData = this.fetchData.bind(this);
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

    componentWillMount(){
      this.fetchData();
    }

    setOutlet(i, ev){
      this.setState({
        selectedOutlet: i
      });
    }

    outletList(){
      var menuItems = []
      $.each(this.state.outlets, function(i, v){
        menuItems.push(<MenuItem key={i} eventKey={i}>{v.name}</MenuItem>)
      }.bind(this));
      return menuItems
    }

    addEquipment(){
      var outletID = this.state.outlets[this.state.selectedOutlet].id
      var payload = {
        name: $("#equipmentName").val(),
        outlet: String(outletID)
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
      var outlet = ''
      if(this.state.selectedOutlet != undefined) {
        outlet = this.state.outlets[this.state.selectedOutlet].name;
      }
      return (
          <div>
           <EquipmentList />
           <hr/>
           Add
           <br />
           Name: <input type="text" id="equipmentName" />
           Outlet:
           <DropdownButton
             title={outlet}
             id="outlet"
             onSelect={this.setOutlet}>
              {this.outletList()}
            </DropdownButton>
            <input type="button" value="save"  onClick={this.addEquipment} />
          </div>
          );
    }
}
