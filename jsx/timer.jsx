import React from 'react'
import $ from 'jquery'

export default class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.fetchData = this.fetchData.bind(this)
    this.update = this.update.bind(this)
  }

  fetchData () {
    $.ajax({
      url: '/api/timers/' + this.props.timer_id,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  update () {
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    return (
      <div>
        {this.props.name}
      </div>
    )
  }
}
