import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Jobs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          selectedEquipment: 'Return Pump',
          equipmentAction: 'On',
          equipments: ["LED Light", "Return Pump", "Power Head", "Heater"],
        };
        this.jobList = this.jobList.bind(this);
        this.equipmentList = this.equipmentList.bind(this);
        this.setEquipment = this.setEquipment.bind(this);
        this.setEquipmentAction = this.setEquipmentAction.bind(this);
        this.saveJob = this.saveJob.bind(this);
    }

    jobList(){
      var list = []
    }

    equipmentList(){
      var menuItems = []
      $.each(this.state.equipments, function(v,k){
        menuItems.push(<MenuItem key={k} eventKey={k}>{k}</MenuItem>)
      }.bind(this));
      return menuItems

    }

    setEquipment(k, ev) {
      this.setState({
        selectedEquipment: k
      });
    }

    setEquipmentAction(k, ev) {
      this.setState({
        equipmentAction: k
      });
    }

    saveJob(){
     var payload = {
       day: $("#day").val(),
       hour: $("#hour").val(),
       minute: $("#minute").val(),
       action: this.state.equipmentAction,
       equipment: this.state.selectedEquipment

     }
      $.ajax({
          url: '/api/jobs',
          type: 'PUT',
          data: JSON.stringify(payload),
          success: function(data) {
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    };

    render() {
      return (
          <div>
           Jobs
           {this.jobList()}
           <hr/>
            Equipment: <DropdownButton  title={this.state.selectedEquipment} id="equipment" onSelect={this.setEquipment}>
              {this.equipmentList()}
            </DropdownButton>
            <br />
            Run at:
            <br />
            Day: <input type="text" id="day" />
            Hour: <input type="text" id="hour"/>
            Minute: <input type="text" id="minute" />
            Action: <DropdownButton  title={this.state.equipmentAction} id="equipmentAction" onSelect={this.setEquipmentAction}>
              <MenuItem key="on" eventKey="on"> On </MenuItem>
              <MenuItem key="off" eventKey="off"> Off </MenuItem>
            </DropdownButton>
            <input type="button" value="save" onClick={this.saveJob} />
          </div>
          );
    }
}
