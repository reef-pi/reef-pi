import React, { Component } from 'react';
import $ from 'jquery';

export default class EquipmentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          data: []
        };
        this.fetchData = this.fetchData.bind(this);
        this.equipments = this.equipments.bind(this);
    }

    componentDidMount(){
      this.fetchData();
    }

    fetchData(){
      $.ajax({
          url: '/api/equipments',
          type: 'GET',
          dataType: 'json',
          success: function(data) {
            this.setState({
              data: data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.log(err.toString());
          }.bind(this)
      });
    }

    equipments(){
      var list = []
      $.each(this.state.data, function(k, v){
        list.push(<li>{v["name"]}</li>)
      }.bind(this));
      return list;
    }

    render(){
      return(
          <div>
            Equipment list
            <ul>
            {this.equipments()}
            </ul>
          </div>
      );
    }
}
