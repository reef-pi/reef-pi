import React from 'react';

export default class Slider extends React.Component {
  constructor(props) {
      super(props);
      this.state = { value: 0 };
      this.onChange = this.onChange.bind(this)
  }
  onChange(e){
    this.setState({
      value: parseInt(e.target.value)
    });
  }
  render(){
   var rangeStyle = {
     WebkitAppearance: 'slider-vertical'
   };
   var tdStyle = {
     textAlign: 'center'
   };
    return (
      <td style={tdStyle}>
        {this.state.value}
        <input type="range" style={rangeStyle} onChange={this.onChange} value={this.state.value}/>
        {this.props.time}
      </td>
    );
  }
}
