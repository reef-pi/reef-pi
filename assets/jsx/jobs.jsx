import React, { Component } from 'react';
import { DropdownButton, MenuItem, Table } from 'react-bootstrap';
import $ from 'jquery';

export default class Jobs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          equipment: undefined,
          equipmentAction: 'on',
          equipments: [],
          jobs: []
        };
        this.jobList = this.jobList.bind(this);
        this.equipmentList = this.equipmentList.bind(this);
        this.setEquipment = this.setEquipment.bind(this);
        this.setEquipmentAction = this.setEquipmentAction.bind(this);
        this.saveJob = this.saveJob.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.removeJob = this.removeJob.bind(this);
    }

    componentWillMount(){
      this.fetchData();
    }


    fetchData(){
      $.ajax({
          url: '/api/jobs',
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            this.setState({
              jobs: data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
      $.ajax({
          url: '/api/equipments',
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            this.setState({
              equipments: data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    jobList(){
      var list = []
      $.each(this.state.jobs, function(k, v){
        list.push(
          <li key={k} id={v.id}>
            {v.name} <input type="button" onClick={this.removeJob} id={"job-"+ v.id} className="btn btn-danger" value="-"/>
          </li>
        );
      }.bind(this));
      return list
    }

    equipmentList(){
      var menuItems = []
      $.each(this.state.equipments, function(k, v){
        menuItems.push(<MenuItem key={k} eventKey={k}>{v.name}</MenuItem>)
      }.bind(this));
      return menuItems
    }

    removeJob(ev) {
      var jobID = ev.target.id.split("-")[1]
      $.ajax({
          url: '/api/jobs/' + jobID,
          type: 'DELETE',
          success: function(data) {
            this.fetchData();
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    setEquipment(k, ev) {
      this.setState({
        equipment: k
      });
    }

    setEquipmentAction(k, ev) {
      this.setState({
        equipmentAction: k
      });
    }

    saveJob(){
     var payload = {
       name: $("#name").val(),
       day: $("#day").val(),
       hour: $("#hour").val(),
       minute: $("#minute").val(),
       second: $("#second").val(),
       action: this.state.equipmentAction,
       equipment: this.state.equipments[this.state.equipment].id
     }
      $.ajax({
          url: '/api/jobs',
          type: 'PUT',
          data: JSON.stringify(payload),
          success: function(data) {
            this.fetchData();
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    };

    render() {
      var eqName = '';
      if(this.state.equipment != undefined){
        eqName = this.state.equipments[this.state.equipment].name
      }

      return (
          <div>
           Jobs
           <ul>{this.jobList()}</ul>
           <hr/>
            Name: <input type="text" id="name" />
            Equipment: <DropdownButton  title={eqName} id="equipment" onSelect={this.setEquipment}>
              {this.equipmentList()}
            </DropdownButton>
            <br />
            Run at:
            <br />
            Day: <input type="text" id="day" />
            Hour: <input type="text" id="hour"/>
            Minute: <input type="text" id="minute" />
            Second: <input type="text" id="second" />
            Action: <DropdownButton  title={this.state.equipmentAction} id="equipmentAction" onSelect={this.setEquipmentAction}>
              <MenuItem key="on" eventKey="on"> On </MenuItem>
              <MenuItem key="off" eventKey="off"> Off </MenuItem>
            </DropdownButton>
            <input type="button" value="save" onClick={this.saveJob} />
          </div>
          );
    }
}
