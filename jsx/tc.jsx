import React from 'react'
import $ from 'jquery'

export default class TemperatureController extends React.Component {
  constructor (props) {
    super(props)
    this.fetchData = this.fetchData.bind(this)
    this.state = {
      config: {}
    }
  }
  fetchData () {
    $.ajax({
      url: '/api/tc',
      type: 'GET',
      success: function (data) {
        this.setState({
          config: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    return (
      <div className='container'>
        <div className="row">
          <div className="col-sm-3"> Minimum Threshold </div>
          <div className="col-sm-2"><input type='text' id='min' className='col-sm-2' /></div>
        </div>
        <div className="row">
          <div className="col-sm-3"> Maximum Threshold </div>
          <div className="col-sm-2"><input type='text' id='max' className='col-sm-2' /></div>
        </div>
        <div className="row">
          <input value='Update' onClick={this.update} type='button' className='btn btn-outline-danger' />
        </div>
      </div>
    )
  }
}

