import React from 'react';

export default class Slider extends React.Component {
  constructor(props) {
      super(props);
      this.state = { value: 0 };
      this.onChange = this.onChange.bind(this)
  }
  onChange(e){
    this.setState({value: e.target.value})
  }
  render(){
   var rangeStyle = {
     WebkitAppearance: 'slider-vertical'
   };
    return (
      <div>
        <input type="text"  className="col-xs" value={this.state.value} />
        <input type="range" style={rangeStyle} onChange={this.onChange}/>
        {this.props.index}
      </div>
    );
  }
}
