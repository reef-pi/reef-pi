import React from 'react';
import Slider from './slider.jsx';
import $ from 'jquery';

export default class Lighting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          intensity_values: [],
          loaded: false,
          enabled: false
        };
        this.set = this.set.bind(this)
        this.unset = this.unset.bind(this)
        this.toggle = this.toggle.bind(this)
        this.loadState = this.loadState.bind(this)
    }

    loadState(){
      $.ajax({
          url: '/api/lighting',
          type: 'GET',
          success: function(data){
            this.setState({
              loaded: true
            });
            console.log(data)
          }.bind(this),
          error: function(xhr, status, err) {
          }.bind(this)
      });
      $.ajax({
          url: '/api/lighting/status',
          type: 'GET',
          success: function(data){
            console.log(data)
          }.bind(this),
          error: function(xhr, status, err) {
          }.bind(this)
      });
    }

    toggle(){
      if(this.state.enabled) {
        this.unset();
      }else{
        this.set();
      }
    }

    set(){
      var intensities = [
        this.refs.h0.state.value,
        this.refs.h2.state.value,
        this.refs.h4.state.value,
        this.refs.h6.state.value,
        this.refs.h8.state.value,
        this.refs.h10.state.value,
        this.refs.h12.state.value,
        this.refs.h14.state.value,
        this.refs.h16.state.value,
        this.refs.h18.state.value,
        this.refs.h20.state.value,
        this.refs.h22.state.value
      ];
      this.setState({
        intensity_values: intensities
      });
      $.ajax({
          url: '/api/lighting',
          type: 'POST',
          data: JSON.stringify({intensities: this.state.intensity_values}),
          success: function(data) {
          }.bind(this),
          error: function(xhr, status, err) {
          }.bind(this)
      });
    }

    unset() {
      $.ajax({
          url: '/api/lighting',
          type: 'DELETE',
          success: function(data) {
            this.setState({
              enabled: false
            });
          }.bind(this),
          error: function(xhr, status, err) {
          }.bind(this)
      });

    }

    render() {
      var tdStyle = {
        textAlign: 'center',
      };
      var tableStyle = {
       width: '50%'
      };
      var sliderSetStyle = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#dddddd'
      };
      if(!this.state.loaded){
       this.loadState();
      }
      return (
          <div className="container">
            <div className="row" style={sliderSetStyle}>
            Set Dusk to Dawn effect
              <table>
                <tbody>
                  <tr>
                    <Slider ref="h0" time="0h"/>
                    <Slider ref="h2" time="2h"/>
                    <Slider ref="h4" time="4h"/>
                    <Slider ref="h6" time="6h"/>
                    <Slider ref="h8" time="8h"/>
                    <Slider ref="h10" time="10h"/>
                    <Slider ref="h12" time="12h"/>
                    <Slider ref="h14" time="14h"/>
                    <Slider ref="h16" time="16h"/>
                    <Slider ref="h18" time="18h"/>
                    <Slider ref="h20" time="20h"/>
                    <Slider ref="h22" time="22h"/>
                  </tr>
                </tbody>
              </table>
              <input type="button" value={this.state.enabled ? 'Disable' : 'Enable'} onClick={this.toggle}/>
            </div>
          </div>
      );
    }
}
