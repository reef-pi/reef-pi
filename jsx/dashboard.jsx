import React from 'react'
import $ from 'jquery'

export default class Dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      info: {},
      displayOn: undefined
    }
    this.refresh = this.refresh.bind(this)
    this.toggleDisplay = this.toggleDisplay.bind(this);
  }

  toggleDisplay(){
    var action = this.state.displayOn ? 'off' : 'on';
    $.ajax({
      url: '/api/display/'+ action,
      type: 'POST',
      success: function (data) {
        this.setState({
          displayOn: !this.state.displayOn
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.refresh()
    setInterval(this.refresh, 180 * 1000)
    $.ajax({
      url: '/api/display',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          displayOn: data.on
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  refresh () {
    $.ajax({
      url: '/api/info',
      type: 'GET',
      success: function (data) {
        this.setState({
          info: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  render () {

    var dispalyStyle = '';
    var displayAction = '';
    if(this.state.displayOn){
      dispalyStyle = 'btn btn-outline-danger';
      displayAction = 'off';
    } else {
      dispalyStyle = 'btn btn-outline-success';
      displayAction = 'on';
    }
    return (
      <div className='container'>
        <h5>Controller Summary</h5>
        <ul className='list-group'>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>Time</div>
              <div className='col-sm-6'>{this.state.info.time}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>IP</div>
              <div className='col-sm-6'>{this.state.info.ip}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>Up Since</div>
              <div className='col-sm-6'>{this.state.info.start_time}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>Temperature</div>
              <div className='col-sm-6'>{this.state.info.temperature}</div>
            </div>
          </li>
          <li className='list-group-item'>
            <div className='row'>
              <div className='col-sm-2'>Display</div>
              <input className='col-sm-6' value={displayAction} onClick={this.toggleDisplay} type="button" className={dispalyStyle}/>
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
