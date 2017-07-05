import React from 'react'
import $ from 'jquery'
import {Area, AreaChart, XAxis, YAxis} from 'recharts'

export default class Temperature extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      readings: []
    }
  }

  render () {
    var data = []
    $.each(this.state.readings, function (k, v) {
      data.push({name: String(k), temperature: v})
    })
    return (
      <div className='row' id='chartContainer'>
        <h5>Temperature</h5>
        <AreaChart data={data} width={700} height={300}>
          <Area type='monotone' dataKey='temperature' stroke='#8884d8' fill='#8884d8' />
          <XAxis dataKey='name' />
          <YAxis />
        </AreaChart>
      </div>
    )
  }
}
